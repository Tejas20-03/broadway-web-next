This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## XPay Integration Setup

The checkout now supports XPay in addition to existing payment methods.

1. Create a `.env.local` file in project root.
2. Add the variables below (do not commit real secrets):

```bash
# Server-only (must NOT be NEXT_PUBLIC)
XPAY_API_BASE_URL=https://xstak-pay-stg.xstak.com
XPAY_ACCOUNT_ID=dd42d85d6caf31a6
XPAY_API_KEY=your_xpay_api_key
XPAY_HMAC_SECRET=your_xpay_hmac_secret

# Client-side XPay element config
NEXT_PUBLIC_XPAY_PUBLISHABLE_KEY=your_xpay_publishable_key
NEXT_PUBLIC_XPAY_ACCOUNT_ID=dd42d85d6caf31a6
NEXT_PUBLIC_XPAY_HMAC_SECRET=your_xpay_hmac_secret
```

3. Restart dev server after updating env values.

### Flow

- `Cash on Delivery`: existing behavior.
- `Digital Payment`: existing behavior (redirect URL if returned by your order API).
- `XPay (Card)`: card is charged first via XPay, then order is submitted.

### Files Added/Updated

- `app/api/xpay/create-payment-intent/route.ts`
- `components/views/CheckoutPage.tsx`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
