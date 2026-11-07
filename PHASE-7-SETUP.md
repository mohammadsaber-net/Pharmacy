# Phase 7 — Product Units and Offers

After replacing the project files with this version:

1. Install dependencies: `npm install`
2. Apply the database migration: `npm run db:migrate`
3. Run checks: `npm run typecheck`, `npm run lint`, and `npm run build`
4. Start the app: `npm run dev`

Migration `0003_units_and_offers.sql` adds the smallest-sale-unit fields, order unit snapshots, and the independent offers and offer-products tables. Existing products keep `units_per_pack = 1`, so their existing stock counts remain unchanged. New stock quantities are stored in the smallest sellable unit.

The offers admin page is available at `/admin/dashboard/offers`; the customer offers page is `/offers`, and the pharmacy information page is `/about`.
