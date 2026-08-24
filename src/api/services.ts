/* Service layer: real Express endpoints with a persistent local mock when the server is absent. */
import { http, USE_MOCK } from './client';
import * as S from '@/data/seed';
import type { Coupon, DashboardStats, DocType, GICertificate, Notification, Order, OrderStatus, Payout, Product, Review, Transaction, Vendor } from '@/types';
import { sleep } from '@/lib/utils';

const KEY = 'tt.vendor.mockdb';
interface DB { vendors: Vendor[]; products: Product[]; orders: Order[]; coupons: Coupon[]; reviews: Review[]; notifications: Notification[] }
function load(): DB { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); const db: DB = { vendors: [S.approvedVendor], products: S.products, orders: S.orders, coupons: S.coupons, reviews: S.reviews, notifications: S.notifications }; save(db); return db; }
function save(db: DB) { localStorage.setItem(KEY, JSON.stringify(db)); }
const db = () => load();
const lat = () => sleep(150 + Math.random() * 200);
let down: boolean | null = null;
async function fb<T>(real: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  if (!USE_MOCK) return real();
  if (down) return mock();
  try { const r = await real(); down = false; return r; } catch (e: unknown) { const st = (e as { status?: number }).status; if (st == null || st === 404 || st >= 500) { if (st == null || st >= 500) down = true; return mock(); } throw e; }
}
const get = <T,>(u: string, params?: object) => http.get<T>(u, { params }).then((r) => r.data);
const post = <T,>(u: string, b?: object) => http.post<T>(u, b).then((r) => r.data);
const put = <T,>(u: string, b?: object) => http.put<T>(u, b).then((r) => r.data);
const now = () => new Date().toISOString();
const err = (message: string, status = 400) => ({ message, status });
const mutVendor = (id: string, f: (v: Vendor) => Vendor) => { const d = db(); d.vendors = d.vendors.map((v) => (v.id === id ? f(v) : v)); save(d); return d.vendors.find((v) => v.id === id)!; };

/* ---------- Auth & onboarding ---------- */
export const auth = {
  register: (b: { ownerName: string; email: string; phone: string; password: string }) => fb(() => post<{ vendor: Vendor; token: string }>('/vendor/auth/register', b), async () => {
    await lat(); const d = db(); if (d.vendors.some((v) => v.email.toLowerCase() === b.email.toLowerCase())) throw err('An account with this email already exists. Log in instead.', 409);
    const vendor = S.blankVendor({ ownerName: b.ownerName, email: b.email, phone: b.phone }); d.vendors.push(vendor); save(d); return { vendor, token: 'mock' };
  }),
  verifyEmailOtp: (email: string, otp: string) => fb(() => post<Vendor>('/vendor/auth/verify-email', { email, otp }), async () => { await lat(); if (otp.length !== 6) throw err('Enter the 6-digit code'); const v = db().vendors.find((x) => x.email === email)!; return mutVendor(v.id, (x) => ({ ...x, emailVerified: true, phoneVerified: true, onboardingStep: Math.max(x.onboardingStep, 1) })); }),
  login: (email: string, password: string) => fb(() => post<{ vendor: Vendor; token: string }>('/vendor/auth/login', { email, password }), async () => {
    await lat(); const v = db().vendors.find((x) => x.email.toLowerCase() === email.toLowerCase()); if (!v || password.length < 6) throw err('Incorrect email or password', 401); return { vendor: v, token: 'mock' };
  }),
  forgot: (email: string) => fb(() => post<{ ok: true }>('/vendor/auth/forgot-password', { email }), async () => { await lat(); return { ok: true as const }; }),
  me: (id: string) => fb(() => get<Vendor>('/vendor/me'), async () => { const v = db().vendors.find((x) => x.id === id); if (!v) throw err('Session expired', 401); return v; }),
};

export const onboarding = {
  saveBusiness: (id: string, b: Pick<Vendor, 'businessName' | 'businessType' | 'gstin' | 'pan' | 'address' | 'productClasses'>) => fb(() => put<Vendor>('/vendor/onboarding/business', b), async () => { await lat(); return mutVendor(id, (v) => ({ ...v, ...b, onboardingStep: Math.max(v.onboardingStep, 2) })); }),
  uploadDocument: (id: string, type: DocType, file: File) => fb(() => { const fd = new FormData(); fd.append('type', type); fd.append('file', file); return http.post<Vendor>('/vendor/onboarding/documents', fd).then((r) => r.data); }, async () => {
    await sleep(900); if (file.size > 5 * 1024 * 1024) throw err('File must be under 5 MB'); if (!/pdf|image/.test(file.type)) throw err('Upload a PDF or an image');
    const extracted: Record<string, string> | undefined = type === 'PAN' ? { 'Name on PAN': 'As per document', 'PAN': '(auto-read)' } : type === 'GST_CERTIFICATE' ? { 'Legal name': 'As per certificate', 'GSTIN': '(auto-read)' } : undefined;
    return mutVendor(id, (v) => ({ ...v, documents: v.documents.map((d) => (d.type === type ? { type, status: 'UPLOADED', fileName: file.name, uploadedAt: now(), extracted } : d)) }));
  }),
  completeDocuments: (id: string) => fb(() => post<Vendor>('/vendor/onboarding/documents/complete'), async () => { await lat(); return mutVendor(id, (v) => ({ ...v, onboardingStep: Math.max(v.onboardingStep, 3) })); }),
  addCertificate: (id: string, c: Omit<GICertificate, 'id' | 'status'>) => fb(() => post<Vendor>('/vendor/onboarding/gi-certificates', c), async () => { await lat(); return mutVendor(id, (v) => ({ ...v, giCertificates: [...v.giCertificates, { ...c, id: `c-${Date.now()}`, status: 'PENDING' }] })); }),
  removeCertificate: (id: string, cid: string) => fb(() => http.delete<Vendor>(`/vendor/onboarding/gi-certificates/${cid}`).then((r) => r.data), async () => mutVendor(id, (v) => ({ ...v, giCertificates: v.giCertificates.filter((c) => c.id !== cid) }))),
  completeCertificates: (id: string) => fb(() => post<Vendor>('/vendor/onboarding/gi-certificates/complete'), async () => mutVendor(id, (v) => ({ ...v, onboardingStep: Math.max(v.onboardingStep, 4) }))),
  saveBank: (id: string, b: { accountName: string; accountNumber: string; ifsc: string }) => fb(() => put<Vendor>('/vendor/onboarding/bank', b), async () => {
    await sleep(1400); const bankName = b.ifsc.toUpperCase().startsWith('SBIN') ? 'State Bank of India' : b.ifsc.toUpperCase().startsWith('HDFC') ? 'HDFC Bank' : b.ifsc.toUpperCase().startsWith('ICIC') ? 'ICICI Bank' : 'Bank';
    return mutVendor(id, (v) => ({ ...v, bank: { accountName: b.accountName, accountNumber: 'XXXXXXXX' + b.accountNumber.slice(-4), ifsc: b.ifsc.toUpperCase(), bankName, verified: true, verifiedAt: now() }, onboardingStep: Math.max(v.onboardingStep, 5) }));
  }),
  submit: (id: string) => fb(() => post<Vendor>('/vendor/onboarding/submit'), async () => { await lat(); return mutVendor(id, (v) => ({ ...v, status: 'PENDING', submittedAt: now() })); }),
  /** Dev helper: simulates the admin decision so the whole flow can be walked end to end. */
  simulateReview: (id: string, outcome: 'APPROVED' | 'CHANGES_REQUESTED') => fb(() => post<Vendor>('/vendor/onboarding/dev-simulate', { outcome }), async () => { await sleep(800); return mutVendor(id, (v) => ({ ...v, status: outcome, approvedAt: outcome === 'APPROVED' ? now() : undefined, statusNote: outcome === 'CHANGES_REQUESTED' ? `The ${v.giCertificates[0]?.giTag ?? 'GI'} certificate scan is not legible. Please upload a clearer copy issued by ${v.giCertificates[0]?.issuedBy ?? 'the registered proprietor'}.` : undefined, documents: v.documents.map((d) => ({ ...d, status: outcome === 'APPROVED' ? 'VERIFIED' : d.status })), giCertificates: v.giCertificates.map((c) => ({ ...c, status: outcome === 'APPROVED' ? 'VERIFIED' : 'REJECTED', note: outcome === 'APPROVED' ? undefined : 'Scan not legible' })) })); }),
  resubmit: (id: string) => fb(() => post<Vendor>('/vendor/onboarding/resubmit'), async () => mutVendor(id, (v) => ({ ...v, status: 'PENDING', statusNote: undefined, submittedAt: now(), giCertificates: v.giCertificates.map((c) => ({ ...c, status: 'PENDING', note: undefined })) }))),
};

/* ---------- Panel ---------- */
export const panel = {
  stats: () => fb(() => get<DashboardStats>('/vendor/dashboard'), async () => { await lat(); return S.stats; }),
  products: () => fb(() => get<Product[]>('/vendor/products'), async () => { await lat(); return db().products; }),
  product: (id: string) => fb(() => get<Product>(`/vendor/products/${id}`), async () => { await lat(); const p = db().products.find((x) => x.id === id); if (!p) throw err('Not found', 404); return p; }),
  saveProduct: (p: Partial<Product> & { id?: string }, submit: boolean) => fb(() => (p.id ? put<Product>(`/vendor/products/${p.id}`, { ...p, submit }) : post<Product>('/vendor/products', { ...p, submit })), async () => {
    await lat(); const d = db(); const status: Product['status'] = submit ? 'PENDING_REVIEW' : 'DRAFT';
    if (p.id) { d.products = d.products.map((x) => (x.id === p.id ? { ...x, ...p, status: x.status === 'APPROVED' && !submit ? 'APPROVED' : status, updatedAt: now() } : x)); save(d); return d.products.find((x) => x.id === p.id)!; }
    const np: Product = { id: `p-${Date.now()}`, slug: (p.title ?? 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'), images: [], variants: [], highlights: [], status, createdAt: now(), updatedAt: now(), lowStockAt: 5, hsn: '', gstRate: 5, weightGrams: 0, stock: 0, price: 0, sku: '', category: '', productClass: 'GI', title: '', shortDescription: '', description: '', ...p } as Product;
    d.products.unshift(np); save(d); return np;
  }),
  updateStock: (id: string, variantId: string | null, stock: number, _reason: string) => fb(() => put<Product>(`/vendor/products/${id}/stock`, { variantId, stock, reason: _reason }), async () => { await lat(); const d = db(); d.products = d.products.map((p) => p.id !== id ? p : variantId ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock } : v)), stock: p.variants.reduce((a, v) => a + (v.id === variantId ? stock : v.stock), 0) } : { ...p, stock, status: stock === 0 ? 'OUT_OF_STOCK' : p.status === 'OUT_OF_STOCK' ? 'APPROVED' : p.status }); save(d); return d.products.find((p) => p.id === id)!; }),
  archiveProduct: (id: string) => fb(() => post<Product>(`/vendor/products/${id}/archive`), async () => { const d = db(); d.products = d.products.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' } : p)); save(d); return d.products.find((p) => p.id === id)!; }),
  orders: () => fb(() => get<Order[]>('/vendor/orders'), async () => { await lat(); return db().orders; }),
  order: (id: string) => fb(() => get<Order>(`/vendor/orders/${id}`), async () => { await lat(); const o = db().orders.find((x) => x.id === id); if (!o) throw err('Not found', 404); return o; }),
  orderAction: (id: string, action: 'CONFIRM' | 'REJECT' | 'PACK' | 'SHIP' | 'RETURN_APPROVE' | 'RETURN_REJECT' | 'RETURN_REFUND', body: Record<string, string> = {}) => fb(() => post<Order>(`/vendor/orders/${id}/${action.toLowerCase()}`, body), async () => {
    await lat(); const d = db(); d.orders = d.orders.map((o) => {
      if (o.id !== id) return o; const t = (status: Order['timeline'][number]['status'], note?: string) => [...o.timeline, { status, at: now(), note }];
      switch (action) {
        case 'CONFIRM': return { ...o, status: 'CONFIRMED' as OrderStatus, timeline: t('CONFIRMED') };
        case 'REJECT': return { ...o, status: 'CANCELLED' as OrderStatus, paymentStatus: o.payment === 'PREPAID' ? 'REFUNDED' : o.paymentStatus, timeline: t('CANCELLED', body.reason) };
        case 'PACK': return { ...o, status: 'PACKED' as OrderStatus, timeline: t('PACKED') };
        case 'SHIP': return { ...o, status: 'SHIPPED' as OrderStatus, shipment: { carrier: body.carrier ?? 'Delhivery', awb: body.awb ?? `DLV${Math.floor(1e9 + Math.random() * 9e9)}`, pickupAt: now(), eta: new Date(Date.now() + 4 * 864e5).toISOString() }, timeline: [...t('PICKUP_SCHEDULED'), { status: 'SHIPPED', at: now() }] };
        case 'RETURN_APPROVE': return { ...o, returnRequest: o.returnRequest && { ...o.returnRequest, status: 'APPROVED' }, timeline: t('RETURN_REQUESTED', 'Return approved, reverse pickup scheduled') };
        case 'RETURN_REJECT': return { ...o, status: 'DELIVERED' as OrderStatus, returnRequest: o.returnRequest && { ...o.returnRequest, status: 'REJECTED' }, timeline: t('DELIVERED', `Return declined: ${body.reason ?? ''}`) };
        case 'RETURN_REFUND': return { ...o, status: 'RETURNED' as OrderStatus, paymentStatus: 'REFUNDED', returnRequest: o.returnRequest && { ...o.returnRequest, status: 'REFUNDED' }, timeline: t('RETURNED', 'Refund issued') };
      }
    }); save(d); return d.orders.find((o) => o.id === id)!;
  }),
  coupons: () => fb(() => get<Coupon[]>('/vendor/coupons'), async () => { await lat(); return db().coupons; }),
  saveCoupon: (c: Partial<Coupon>) => fb(() => (c.id ? put<Coupon>(`/vendor/coupons/${c.id}`, c) : post<Coupon>('/vendor/coupons', c)), async () => { await lat(); const d = db(); if (c.id) { d.coupons = d.coupons.map((x) => (x.id === c.id ? { ...x, ...c } : x)); } else { d.coupons.unshift({ id: `cp-${Date.now()}`, used: 0, active: true, code: '', type: 'PERCENT', value: 0, startsAt: now(), endsAt: now(), ...c } as Coupon); } save(d); return d.coupons[0]!; }),
  transactions: () => fb(() => get<Transaction[]>('/vendor/finance/transactions'), async () => { await lat(); return S.transactions; }),
  payouts: () => fb(() => get<Payout[]>('/vendor/finance/payouts'), async () => { await lat(); return S.payouts; }),
  reviews: () => fb(() => get<Review[]>('/vendor/reviews'), async () => { await lat(); return db().reviews; }),
  replyReview: (id: string, body: string) => fb(() => post<Review>(`/vendor/reviews/${id}/reply`, { body }), async () => { const d = db(); d.reviews = d.reviews.map((r) => (r.id === id ? { ...r, reply: { body, at: now() } } : r)); save(d); return d.reviews.find((r) => r.id === id)!; }),
  notifications: () => fb(() => get<Notification[]>('/vendor/notifications'), async () => db().notifications),
  markRead: () => fb(() => post<void>('/vendor/notifications/read-all'), async () => { const d = db(); d.notifications = d.notifications.map((n) => ({ ...n, read: true })); save(d); }),
  updateProfile: (id: string, p: Partial<Vendor>) => fb(() => put<Vendor>('/vendor/profile', p), async () => { await lat(); return mutVendor(id, (v) => ({ ...v, ...p })); }),
  addCertificate: onboarding.addCertificate,
};
