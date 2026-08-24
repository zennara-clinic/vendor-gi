import type { Coupon, DashboardStats, Order, Payout, Product, Review, Transaction, Notification, Vendor } from '@/types';
const img = (id: string, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const ago = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

export const approvedVendor: Vendor = {
  id: 'v1', ownerName: 'Tenzing Lepcha', email: 'tenzing@makaibari.in', phone: '9876501234', emailVerified: true, phoneVerified: true,
  businessName: 'Makaibari Estate Collective', businessType: 'Co-operative society', gstin: '19AABCM1234F1Z5', pan: 'AABCM1234F',
  address: { line1: 'Makaibari Tea Estate, Pankhabari Road', city: 'Kurseong', state: 'West Bengal', pincode: '734203' },
  productClasses: ['GI'], status: 'APPROVED', submittedAt: ago(40), approvedAt: ago(37), onboardingStep: 5,
  documents: [
    { type: 'GST_CERTIFICATE', status: 'VERIFIED', fileName: 'gst-certificate.pdf', uploadedAt: ago(40) },
    { type: 'PAN', status: 'VERIFIED', fileName: 'pan.jpg', uploadedAt: ago(40) },
    { type: 'AADHAAR', status: 'VERIFIED', fileName: 'aadhaar.pdf', uploadedAt: ago(40) },
    { type: 'ADDRESS_PROOF', status: 'VERIFIED', fileName: 'electricity-bill.pdf', uploadedAt: ago(40) },
    { type: 'BANK_PROOF', status: 'VERIFIED', fileName: 'cancelled-cheque.jpg', uploadedAt: ago(40) },
  ],
  giCertificates: [{ id: 'c1', giTag: 'Darjeeling Tea', certificateNumber: 'TBI/DJ/2023/0412', issuedBy: 'Tea Board of India', issuedAt: '2023-04-01', expiresAt: '2026-03-31', fileName: 'tea-board-certificate.pdf', status: 'VERIFIED' }],
  bank: { accountName: 'Makaibari Estate Collective', accountNumber: 'XXXXXXXX4412', ifsc: 'SBIN0001234', bankName: 'State Bank of India', verified: true, verifiedAt: ago(39) },
  logo: img('photo-1544787219-7f47ccb76574', 200), description: 'Estate-direct Darjeeling teas, biodynamic since 1988.', returnPolicyDays: 7, commissionPct: 10,
};

export const blankVendor = (p: Partial<Vendor>): Vendor => ({
  id: `v-${Date.now()}`, ownerName: '', email: '', phone: '', emailVerified: false, phoneVerified: false, businessName: '', businessType: '', gstin: '', pan: '',
  address: { line1: '', city: '', state: '', pincode: '' }, productClasses: ['GI'], status: 'DRAFT', onboardingStep: 0,
  documents: (['GST_CERTIFICATE', 'PAN', 'AADHAAR', 'ADDRESS_PROOF', 'BANK_PROOF'] as const).map((type) => ({ type, status: 'NOT_UPLOADED' as const })),
  giCertificates: [], returnPolicyDays: 7, commissionPct: 10, ...p,
});

export const products: Product[] = [
  { id: 'p1', title: 'Darjeeling First Flush 2026, Muscatel Black Tea, Loose Leaf', slug: 'darjeeling-first-flush-2026-muscatel', category: 'Tea & Coffee', productClass: 'GI', giTag: 'Darjeeling Tea', certificateId: 'c1', shortDescription: 'Spring-plucked FTGFOP1 with the classic muscatel note.', description: 'Harvested in the last week of March from our upper-elevation sections.', images: [img('photo-1564890369478-c89ca6d9cde9'), img('photo-1594631252845-29fc4cc8cde9')], price: 1249, mrp: 1599, stock: 84, sku: 'MKB-FF26-100', hsn: '0902', gstRate: 5, weightGrams: 120, variants: [{ id: 'v1', title: '100 g', sku: 'MKB-FF26-100', price: 1249, mrp: 1599, stock: 84 }, { id: 'v2', title: '250 g', sku: 'MKB-FF26-250', price: 2799, mrp: 3599, stock: 31 }, { id: 'v3', title: '500 g', sku: 'MKB-FF26-500', price: 5199, mrp: 6999, stock: 9 }], status: 'APPROVED', rating: 4.7, ratingCount: 2310, sold: 5400, views: 48200, createdAt: ago(30), updatedAt: ago(2), lowStockAt: 10, highlights: ['Single-estate', 'FTGFOP1 grade'] },
  { id: 'p2', title: 'Darjeeling Second Flush 2025, Summer Muscatel, 100 g Tin', slug: 'darjeeling-second-flush-tin', category: 'Tea & Coffee', productClass: 'GI', giTag: 'Darjeeling Tea', certificateId: 'c1', shortDescription: 'Fuller-bodied summer harvest.', description: '', images: [img('photo-1594631252845-29fc4cc8cde9')], price: 999, mrp: 1299, stock: 70, sku: 'MKB-SF25-100T', hsn: '0902', gstRate: 5, weightGrams: 180, variants: [], status: 'APPROVED', rating: 4.6, ratingCount: 980, sold: 2600, views: 21000, createdAt: ago(60), updatedAt: ago(5), lowStockAt: 15, highlights: [] },
  { id: 'p3', title: 'Darjeeling Green Tea, Autumn 2025, 100 g', slug: 'darjeeling-green-autumn', category: 'Tea & Coffee', productClass: 'GI', giTag: 'Darjeeling Tea', certificateId: 'c1', shortDescription: 'Light, grassy autumn green.', description: '', images: [img('photo-1576092768241-dec231879fc3')], price: 749, mrp: 899, stock: 6, sku: 'MKB-GR25-100', hsn: '0902', gstRate: 5, weightGrams: 120, variants: [], status: 'APPROVED', rating: 4.4, ratingCount: 212, sold: 640, views: 6100, createdAt: ago(90), updatedAt: ago(1), lowStockAt: 10, highlights: [] },
  { id: 'p4', title: 'Makaibari Silver Tips Imperial, 50 g', slug: 'silver-tips-imperial', category: 'Tea & Coffee', productClass: 'GI', giTag: 'Darjeeling Tea', certificateId: 'c1', shortDescription: 'Moonlight-plucked white tea.', description: '', images: [img('photo-1597318181409-cf64d0b5d8a2')], price: 3999, mrp: 4999, stock: 0, sku: 'MKB-STI-50', hsn: '0902', gstRate: 5, weightGrams: 70, variants: [], status: 'OUT_OF_STOCK', rating: 4.9, ratingCount: 88, sold: 140, views: 9800, createdAt: ago(120), updatedAt: ago(3), lowStockAt: 5, highlights: [] },
  { id: 'p5', title: 'Kurseong Hill Honey, Wild Forest, 250 g', slug: 'kurseong-hill-honey', category: 'Wellness & Beauty', productClass: 'HERITAGE', shortDescription: 'Raw honey from estate apiaries.', description: '', images: [img('photo-1587049352846-4a222e784d38')], price: 549, mrp: 649, stock: 40, sku: 'MKB-HNY-250', hsn: '0409', gstRate: 5, weightGrams: 350, variants: [], status: 'PENDING_REVIEW', createdAt: ago(2), updatedAt: ago(2), lowStockAt: 10, highlights: [] },
  { id: 'p6', title: 'Tea Tasting Gift Box, 4 x 25 g', slug: 'tea-tasting-gift-box', category: 'Tea & Coffee', productClass: 'GI', giTag: 'Darjeeling Tea', certificateId: 'c1', shortDescription: 'Four seasons of Darjeeling in one box.', description: '', images: [img('photo-1563911892437-1feda0179e1b')], price: 1899, mrp: 2299, stock: 25, sku: 'MKB-GIFT-4', hsn: '0902', gstRate: 5, weightGrams: 260, variants: [], status: 'CHANGES_REQUIRED', reviewNote: 'Please add a clear photo of the GI label on the box and list net weight per tin.', createdAt: ago(6), updatedAt: ago(4), lowStockAt: 10, highlights: [] },
  { id: 'p7', title: 'Estate Tea Strainer, Brass', slug: 'brass-strainer', category: 'Home & Decor', productClass: 'TRADITION', shortDescription: 'Hand-finished brass strainer.', description: '', images: [img('photo-1578662996442-48f60103fc96')], price: 399, stock: 12, sku: 'MKB-STR-BR', hsn: '7323', gstRate: 12, weightGrams: 90, variants: [], status: 'DRAFT', createdAt: ago(1), updatedAt: ago(1), lowStockAt: 5, highlights: [] },
];

const addr = (c: string, s: string, p: string) => ({ line1: '14, Lakshmi Nagar, 3rd Cross', city: c, state: s, pincode: p });
const mk = (i: number, status: Order['status'], d: number, items: Order['items'], extra: Partial<Order> = {}): Order => {
  const subtotal = items.reduce((a, b) => a + b.qty * b.unitPrice, 0); const commission = Math.round(subtotal * 0.1);
  return { id: `o${i}`, number: `TT-2608-${48000 + i * 37}`, placedAt: ago(d, i), status, items, subtotal, discount: 0, shipping: 0, total: subtotal, commission, netEarning: subtotal - commission, payment: i % 3 === 0 ? 'COD' : 'PREPAID', paymentStatus: i % 3 === 0 ? 'PENDING' : 'PAID', customer: { name: ['Ananya Rao', 'Vikram Singh', 'Priya Menon', 'Rahul Khanna', 'Deepa Nair', 'Arjun Tiwari'][i % 6]!, phone: '98765 43210', email: 'customer@example.com' }, address: [addr('Bengaluru', 'Karnataka', '560078'), addr('Mumbai', 'Maharashtra', '400050'), addr('Pune', 'Maharashtra', '411001'), addr('Chennai', 'Tamil Nadu', '600040')][i % 4]!, timeline: [{ status: 'NEW', at: ago(d, i) }], ...extra };
};
const it = (p: Product, qty = 1, variant?: string, unitPrice?: number): Order['items'][number] => ({ id: `${p.id}-${qty}`, productId: p.id, title: p.title, image: p.images[0]!, variant, qty, unitPrice: unitPrice ?? p.price });
export const orders: Order[] = [
  mk(1, 'NEW', 0, [it(products[0]!, 2, '250 g', 2799)], { slaDueAt: new Date(Date.now() + 20 * 36e5).toISOString() }),
  mk(2, 'NEW', 0, [it(products[1]!), it(products[2]!)], { slaDueAt: new Date(Date.now() + 9 * 36e5).toISOString() }),
  mk(3, 'CONFIRMED', 1, [it(products[5]!)], { timeline: [{ status: 'NEW', at: ago(1) }, { status: 'CONFIRMED', at: ago(1, -2) }] }),
  mk(4, 'PACKED', 1, [it(products[0]!, 1, '100 g')], { timeline: [{ status: 'NEW', at: ago(1) }, { status: 'CONFIRMED', at: ago(1, -1) }, { status: 'PACKED', at: ago(0, 6) }] }),
  mk(5, 'SHIPPED', 3, [it(products[1]!, 3)], { shipment: { carrier: 'Delhivery', awb: 'DLV1234567890', eta: ago(-2) }, timeline: [{ status: 'NEW', at: ago(3) }, { status: 'CONFIRMED', at: ago(3, -1) }, { status: 'PACKED', at: ago(2) }, { status: 'SHIPPED', at: ago(2, -5) }] }),
  mk(6, 'DELIVERED', 9, [it(products[0]!, 1, '500 g', 5199)], { shipment: { carrier: 'Bluedart', awb: 'BD9988776655' }, timeline: [{ status: 'NEW', at: ago(9) }, { status: 'SHIPPED', at: ago(8) }, { status: 'DELIVERED', at: ago(5) }] }),
  mk(7, 'RETURN_REQUESTED', 12, [it(products[2]!, 2)], { shipment: { carrier: 'Delhivery', awb: 'DLV5566778899' }, returnRequest: { reason: 'Damaged on arrival', type: 'REFUND', requestedAt: ago(1), note: 'Tin was dented and seal broken.', status: 'REQUESTED' }, timeline: [{ status: 'NEW', at: ago(12) }, { status: 'DELIVERED', at: ago(8) }, { status: 'RETURN_REQUESTED', at: ago(1) }] }),
  mk(8, 'DELIVERED', 15, [it(products[1]!)], { timeline: [{ status: 'NEW', at: ago(15) }, { status: 'DELIVERED', at: ago(11) }] }),
  mk(9, 'CANCELLED', 4, [it(products[2]!)], { paymentStatus: 'REFUNDED', timeline: [{ status: 'NEW', at: ago(4) }, { status: 'CANCELLED', at: ago(4, -1), note: 'Customer cancelled before dispatch' }] }),
  mk(10, 'DELIVERED', 20, [it(products[0]!, 4, '100 g')], { timeline: [{ status: 'NEW', at: ago(20) }, { status: 'DELIVERED', at: ago(16) }] }),
];

export const coupons: Coupon[] = [
  { id: 'cp1', code: 'FIRSTFLUSH10', type: 'PERCENT', value: 10, minOrder: 999, maxDiscount: 500, usageLimit: 500, used: 212, startsAt: ago(20), endsAt: ago(-20), active: true },
  { id: 'cp2', code: 'ESTATE200', type: 'FLAT', value: 200, minOrder: 1999, usageLimit: 100, used: 100, startsAt: ago(60), endsAt: ago(5), active: false },
];
export const transactions: Transaction[] = [
  { id: 't1', at: ago(0), type: 'SALE', ref: 'TT-2608-48037', amount: 5598, status: 'PENDING' },
  { id: 't2', at: ago(0), type: 'COMMISSION', ref: 'TT-2608-48037', amount: -560, status: 'PENDING' },
  { id: 't3', at: ago(5), type: 'SALE', ref: 'TT-2608-48222', amount: 5199, status: 'AVAILABLE' },
  { id: 't4', at: ago(5), type: 'COMMISSION', ref: 'TT-2608-48222', amount: -520, status: 'AVAILABLE' },
  { id: 't5', at: ago(7), type: 'PAYOUT', ref: 'PO-2026-33', amount: -18420, status: 'PAID' },
  { id: 't6', at: ago(7), type: 'TDS', ref: 'PO-2026-33', amount: -184, status: 'PAID' },
  { id: 't7', at: ago(11), type: 'REFUND', ref: 'TT-2608-48333', amount: -749, status: 'PAID' },
];
export const payouts: Payout[] = [
  { id: 'po1', period: '18 Aug to 24 Aug 2026', amount: 4679, status: 'SCHEDULED' },
  { id: 'po2', period: '11 Aug to 17 Aug 2026', amount: 18420, status: 'PAID', paidAt: ago(7), bankRef: 'SBIN26082114412' },
  { id: 'po3', period: '4 Aug to 10 Aug 2026', amount: 22104, status: 'PAID', paidAt: ago(14), bankRef: 'SBIN26081403311' },
];
export const reviews: Review[] = [
  { id: 'r1', productId: 'p1', productTitle: products[0]!.title, customer: 'Ananya R.', rating: 5, title: 'Genuine and beautifully packed', body: 'The authenticity code scanned and showed the batch and certificate. Lovely muscatel.', at: ago(1), verified: true },
  { id: 'r2', productId: 'p2', productTitle: products[1]!.title, customer: 'Vikram S.', rating: 4, body: 'Good tea but the tin arrived slightly dented.', at: ago(3), verified: true },
  { id: 'r3', productId: 'p1', productTitle: products[0]!.title, customer: 'Priya M.', rating: 5, body: 'Second order. Consistent quality.', at: ago(6), verified: true, reply: { body: 'Thank you Priya. Every batch is registered before it ships.', at: ago(5) } },
  { id: 'r4', productId: 'p3', productTitle: products[2]!.title, customer: 'Rahul K.', rating: 3, body: 'Expected more flavour for the price.', at: ago(9), verified: false },
];
export const notifications: Notification[] = [
  { id: 'n1', title: '2 new orders to confirm', body: 'Confirm within 24 hours to meet the SLA.', at: ago(0), read: false, link: '/orders?tab=NEW' },
  { id: 'n2', title: 'Return requested on TT-2608-48259', body: 'Damaged on arrival. Respond within 48 hours.', at: ago(1), read: false, link: '/orders/o7' },
  { id: 'n3', title: 'Changes required: Tea Tasting Gift Box', body: 'Reviewer asked for a GI label photo.', at: ago(4), read: true, link: '/products/p6' },
  { id: 'n4', title: 'Payout of 18,420 rupees sent', body: 'Reference SBIN26082114412.', at: ago(7), read: true, link: '/earnings' },
];
export const stats: DashboardStats = {
  today: { revenue: 7897, orders: 2 }, week: { revenue: 31490, orders: 11 }, month: { revenue: 128640, orders: 47 },
  pendingOrders: 2, toShip: 2, returns: 1, lowStock: 2, rating: 4.7, ratingCount: 2310, availableBalance: 4679, pendingBalance: 5038, nextPayout: { date: ago(-3), amount: 4679 },
  series: Array.from({ length: 30 }, (_, i) => ({ day: ago(29 - i).slice(0, 10), revenue: 2000 + Math.round(3500 * Math.abs(Math.sin(i / 3.1)) + (i % 7 === 5 ? 4000 : 0)), orders: 1 + Math.round(2 * Math.abs(Math.sin(i / 3.1))) })),
  topProducts: [{ id: 'p1', title: products[0]!.title, image: products[0]!.images[0]!, sold: 126, revenue: 157374 }, { id: 'p2', title: products[1]!.title, image: products[1]!.images[0]!, sold: 61, revenue: 60939 }, { id: 'p3', title: products[2]!.title, image: products[2]!.images[0]!, sold: 22, revenue: 16478 }],
};
