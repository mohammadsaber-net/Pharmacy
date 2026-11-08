# Phase 8 — Delivery, payments, admin roles, and offers

## Deploy steps

1. Install dependencies with `npm ci`.
2. Confirm `DATABASE_URL` is configured for the same Neon database used by the current deployment.
3. Apply the schema changes:

   ```bash
   npm run db:migrate
   ```

4. Promote the existing main admin account to Owner (use the same credentials already configured in `.env`):

   ```bash
   npm run admin:create
   ```

5. Deploy the updated project to Vercel.
6. Sign in as Owner, open **إعدادات المتجر**, set the InstaPay number and delivery fee, and keep delivery disabled until ready.
7. Open **المستخدمون والصلاحيات** to create staff accounts and select their access scopes.

## Verification checklist

- [ ] Open the storefront on iPhone Safari and confirm the hero area has no black rendering tile.
- [ ] Open a product with multiple units per pack; switch between a single unit and a full pack.
- [ ] In the cart, convert 3 single units to 1 pack, 7 single units to 2 packs, and 2 packs to 10 single units. Confirm stock constraints prevent over-allocation.
- [ ] Create an offer with a percentage discount; confirm the final price is calculated automatically and rounded to one decimal place.
- [ ] Confirm the offer appears on the offers page with original and discounted prices.
- [ ] With delivery disabled, choose home delivery in checkout. Confirm the unavailable message appears only after that choice, and the dashboard delivery-request count increases.
- [ ] Enable delivery and set a fee. Confirm checkout shows the address field and delivery payment choice.
- [ ] Choose InstaPay, submit a test receipt, and confirm it appears in **المدفوعات**.
- [ ] Confirm the payment from the dashboard and verify the order status reflects paid.
- [ ] Place a pickup order and confirm the half-hour preparation message.
- [ ] Create an admin with limited permissions; verify restricted API actions return 403 and unavailable menu items are hidden.
