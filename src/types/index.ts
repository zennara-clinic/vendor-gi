export type ID = string;
export type ProductBadge = 'DEAL' | 'NEW' | 'BESTSELLER' | 'GI_VERIFIED';

export type VendorStatus = 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type DocType = 'GST_CERTIFICATE' | 'PAN' | 'AADHAAR' | 'ADDRESS_PROOF' | 'BANK_PROOF';
export type DocStatus = 'NOT_UPLOADED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface VendorDocument { type: DocType; status: DocStatus; fileName?: string; uploadedAt?: string; note?: string; extracted?: Record<string, string> }
export interface GICertificate { id: ID; giTag: string; certificateNumber: string; issuedBy: string; issuedAt: string; expiresAt: string; fileName?: string; status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'; note?: string }
export interface BankDetails { accountName: string; accountNumber: string; ifsc: string; bankName?: string; verified: boolean; verifiedAt?: string }

export interface Vendor {
  id: ID; ownerName: string; email: string; phone: string; emailVerified: boolean; phoneVerified: boolean;
  businessName: string; businessType: string; gstin: string; pan: string; address: { line1: string; city: string; state: string; pincode: string };
  productClasses: ('GI' | 'HERITAGE' | 'TRADITION')[];
  status: VendorStatus; statusNote?: string; submittedAt?: string; approvedAt?: string;
  onboardingStep: number; // 0..5
  documents: VendorDocument[]; giCertificates: GICertificate[]; bank?: BankDetails;
  logo?: string; description?: string; returnPolicyDays: number; commissionPct: number;
}

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED' | 'OUT_OF_STOCK' | 'INACTIVE' | 'ARCHIVED';
export interface Variant { id: ID; title: string; sku: string; price: number; mrp?: number; stock: number }
export interface Product {
  id: ID; title: string; slug: string; category: string; productClass: 'GI' | 'HERITAGE' | 'TRADITION'; giTag?: string; certificateId?: ID;
  shortDescription: string; description: string; images: string[]; price: number; mrp?: number; stock: number; sku: string; hsn: string; gstRate: number;
  weightGrams: number; variants: Variant[]; status: ProductStatus; reviewNote?: string; rating?: number; ratingCount?: number; sold?: number; views?: number;
  createdAt: string; updatedAt: string; lowStockAt: number; originStory?: string; highlights: string[];
}

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
export interface OrderItem { id: ID; productId: ID; title: string; image: string; variant?: string; qty: number; unitPrice: number; authenticityCode?: string }
export interface Order {
  id: ID; number: string; placedAt: string; status: OrderStatus; items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number; commission: number; netEarning: number;
  payment: 'PREPAID' | 'COD'; paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  customer: { name: string; phone: string; email: string }; address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  shipment?: { carrier: string; awb: string; labelUrl?: string; pickupAt?: string; eta?: string };
  timeline: { status: OrderStatus | 'PICKUP_SCHEDULED'; at: string; note?: string }[];
  returnRequest?: { reason: string; type: 'REFUND' | 'REPLACEMENT'; requestedAt: string; note?: string; status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PICKED_UP' | 'REFUNDED' };
  slaDueAt?: string;
}

export interface Coupon { id: ID; code: string; type: 'PERCENT' | 'FLAT' | 'FREE_SHIPPING'; value: number; minOrder?: number; maxDiscount?: number; usageLimit?: number; used: number; startsAt: string; endsAt: string; active: boolean }
export interface Transaction { id: ID; at: string; type: 'SALE' | 'COMMISSION' | 'REFUND' | 'PAYOUT' | 'TDS' | 'ADJUSTMENT'; ref: string; amount: number; status: 'PENDING' | 'AVAILABLE' | 'PAID' }
export interface Payout { id: ID; period: string; amount: number; status: 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED'; paidAt?: string; bankRef?: string }
export interface Review { id: ID; productId: ID; productTitle: string; customer: string; rating: number; title?: string; body: string; at: string; reply?: { body: string; at: string }; verified: boolean }
export interface Notification { id: ID; title: string; body: string; at: string; read: boolean; link?: string }
export interface DashboardStats {
  today: { revenue: number; orders: number }; week: { revenue: number; orders: number }; month: { revenue: number; orders: number };
  pendingOrders: number; toShip: number; returns: number; lowStock: number; rating: number; ratingCount: number; availableBalance: number; pendingBalance: number; nextPayout: { date: string; amount: number };
  series: { day: string; revenue: number; orders: number }[]; topProducts: { id: ID; title: string; image: string; sold: number; revenue: number }[];
}
export interface ApiError { message: string; status?: number; errors?: Record<string, string[]> }
