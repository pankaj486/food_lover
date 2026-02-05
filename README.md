This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install dependencies and set up MongoDB (Atlas):

```bash
npm install
```

Set `MONGODB_URI` in `.env` (include a database name in the URI), then push the Prisma schema and seed a demo user (optional if you use the new registration form):

```bash
npm run db:push
npm run db:seed
```

Now run the development server:

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

You can start editing the page by modifying `app/page.js` and `app/login/page.js`. The page auto-updates as you edit the files.

## OTP Login Flow

Login now triggers an OTP verification step before issuing tokens:

1. `/api/login` verifies credentials and generates a 6-digit OTP.
2. `/api/verify-otp` verifies the OTP and then issues access + refresh tokens.

Development helpers:
- `OTP_TTL_MINUTES` controls OTP expiry (default 10 minutes).
- `OTP_DEV_MODE=true` will expose the OTP in the response header `x-otp-dev-code` to help local testing.

SMTP email delivery is stubbed for now; I will wire it once you provide SMTP details.

### SMTP Env Vars
Add these to `.env` to enable OTP email delivery:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# food_lover
