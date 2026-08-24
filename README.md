# Tag Traditions Seller Centre (vendor-panel)

Separate React + Vite SPA for sellers. Runs on **http://localhost:5174**. Shares the storefront's design tokens and UI kit.

```bash
cd "new version/vendor-panel"
npm install
npm run dev
```

## Flow
`/register` → `/verify-email` (OTP) → `/onboarding` (Business & KYC → Documents → GI certificates → Bank penny-drop → Review) → `/application-status` (pending / changes requested / approved) → `/dashboard`.

Route guards (`src/components/layout/Guards.tsx`) send a seller to the right place for their state; the panel is only reachable once `status === 'APPROVED'`.

## Panel
Dashboard, Orders (confirm / reject / pack / ship with courier pickup), Returns (approve / decline / refund), Products (list + full add/edit form with variants, GI claim, images, HSN/GST), Inventory (reason-coded stock updates), Coupons, Earnings (transactions, payouts, GST/TDS), Reviews (one reply each), GI Certificates (renewal reminders), Settings (profile, documents, bank, team, security), Help.

## Mock mode
Without the server the app uses a persistent local mock (`localStorage` key `tt.vendor.mockdb`). Demo approved seller: `tenzing@makaibari.in` with any 6+ character password. The status page shows a **development-only** panel to simulate the admin's decision so the whole flow can be walked. Clear the key to reset.

Endpoints expected from the server are listed in `src/api/services.ts` (prefix `/vendor/...`).
