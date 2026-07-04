# Stripe Test Cards

Use these on any Stripe checkout page when `STRIPE_SECRET_KEY` starts with `sk_test_`.

## ✅ Card that always succeeds

| Field | Value |
|-------|-------|
| **Card number** | `4242 4242 4242 4242` |
| **Expiry** | `12 / 34` |
| **CVC** | `123` |
| **Name** | `Test User` |
| **Country** | Any (e.g. United States) |
| **ZIP** | `10001` |

> Use this for the Athena billing checkout — it will complete the trial and trigger the `checkout.session.completed` webhook.

---

## Other useful test cards

| Scenario | Card Number | Notes |
|----------|-------------|-------|
| ✅ Visa success | `4242 4242 4242 4242` | Standard success |
| ✅ Mastercard success | `5555 5555 5555 4444` | |
| 🔐 Requires 3D Secure auth | `4000 0025 0000 3155` | Opens auth popup — click "Complete" |
| ❌ Always declined | `4000 0000 0000 0002` | Generic decline |
| ❌ Insufficient funds | `4000 0000 0000 9995` | Decline with `insufficient_funds` |
| ❌ Expired card | `4000 0000 0000 0069` | Decline with `expired_card` |
| ❌ Wrong CVC | `4000 0000 0000 0127` | Decline with `incorrect_cvc` |

All test cards use:
- **Expiry:** any future date, e.g. `12 / 34`
- **CVC:** any 3 digits, e.g. `123`
- **ZIP:** any 5 digits, e.g. `10001`

---

## Stripe CLI (local webhook forwarding)

```bash
stripe listen --api-key sk_test_51Thx... --forward-to localhost:3000/api/stripe/webhooks
```

The CLI prints a new `whsec_...` secret each time it starts — update `STRIPE_WEBHOOK_SECRET` in `.env.local` if it changes.

---

## Price IDs (test mode)

| Plan | Price ID | Amount |
|------|----------|--------|
| Monthly | `price_1Thxn15ZDCGHm439UwKCxIxN` | $29/month |
| Annual | `price_1Thxn85ZDCGHm439m8JqfvbC` | $199/year |

---

## After checkout completes

1. Stripe CLI terminal shows `checkout.session.completed` event
2. App's `/api/stripe/webhooks` receives it and writes to `subscriptions` table
3. User's `subscription_status` updates to `trialing`
4. `/billing` page shows active plan with "Manage billing" button
