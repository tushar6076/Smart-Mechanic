This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Payments and administrator setup

Product checkout uses Razorpay **test mode only**. Configure `RAZORPAY_KEY_ID` with a key beginning `rzp_test_` and set `RAZORPAY_KEY_SECRET` on the server. The app rejects live-key IDs; do not use live credentials in this project. Test-mode checkout creates sandbox orders and verifies payment signatures server-side.

The public sign-up flow intentionally allows customer and worker accounts, not administrator accounts. To create the first administrator, set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` in the local environment (use a password with at least 12 characters), then run:

```bash
npm run admin:create
```

The command creates an admin only if the email is unused. If it already belongs to a non-admin account, it fails without changing that account. Keep bootstrap credentials out of source control and remove them from the environment after setup.

## Docker Compose

Copy `.env.example` to `.env`, set the same strong URL-safe password in `POSTGRES_PASSWORD`, `DATABASE_URL`, and `INTERNAL_DATABASE_URL`, and provide the required session, Titan SMTP, and Razorpay test-mode settings. Keep `DATABASE_URL` pointed at `localhost` for host commands and `INTERNAL_DATABASE_URL` pointed at the Compose `db` service. Then run:

```bash
docker compose up --build
```

Compose starts PostgreSQL and Redis with health checks, applies checked-in Prisma migrations to the Compose database, and then starts the app at `http://localhost:3001`. The app container uses service DNS names for its database and Redis; do not set its `DATABASE_URL` or `REDIS_URL` to `localhost`. The Docker database has its own named volume and is separate from any local or hosted database configured in `DATABASE_URL`. Run `npm run admin:create` from the host with `DATABASE_URL` pointing at the exposed Compose PostgreSQL port to provision the first administrator.

## Styling tokens

The application theme is centralized in `src/app/globals.css`. Edit its CSS custom properties for the brand color, palette, spacing scale, typography scale, and shared background effects; existing Tailwind utilities resolve those values from the shared tokens. Email clients often ignore linked stylesheets, so email templates keep inline styles but source their colors from the shared `emailTheme` palette in `src/app/services/email/templates.ts`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
