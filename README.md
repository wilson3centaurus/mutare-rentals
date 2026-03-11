# MutareRentals 🏠

AI-driven geospatial platform to browse, list, and predict house rental prices in **Mutare Province, Zimbabwe**.

> **Project by:** Brian Ngoma (M22DNX) — Dissertation Project

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API | **Next.js 14** (App Router, TypeScript) |
| Database | **Neon** (serverless PostgreSQL — free tier) |
| ORM | **Prisma** |
| Styling | **Tailwind CSS v4** |
| Map | **Leaflet.js** (via dynamic import — SSR safe) |
| AI Prediction | Custom weighted model (`src/lib/prediction.ts`) |
| Deployment | **Netlify** (`@netlify/plugin-nextjs`) |

---

## Features

- 🔍 **Browse Listings** — Filter by suburb, price, bedrooms, property type
- 🗺️ **Interactive Map** — All properties plotted on OpenStreetMap with price bubbles
- 🤖 **AI Price Predictor** — Estimates fair rent based on suburb, size, amenities
- ➕ **List Property** — Landlords can submit properties directly
- 📊 **Dashboard** — Market stats: avg price, suburb breakdown, recent listings

---

## Getting Started

### 1. Set up Neon Database (free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **pooled connection string** and **direct connection string**

### 2. Configure environment variables

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASS@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DATABASE_URL_UNPOOLED="postgresql://USER:PASS@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run migrations & seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home / landing page
│   ├── properties/
│   │   ├── page.tsx          # Listings with filters
│   │   └── [id]/page.tsx     # Property detail
│   ├── map/page.tsx          # Interactive map view
│   ├── predict/page.tsx      # AI price predictor
│   ├── list-property/page.tsx# Landlord submission form
│   ├── dashboard/page.tsx    # Market statistics
│   └── api/
│       ├── properties/       # GET/POST listings
│       ├── properties/[id]/  # GET/PUT/DELETE single
│       ├── predict/          # POST AI prediction
│       └── stats/            # GET market stats
├── components/
│   ├── Navbar.tsx
│   ├── PropertyCard.tsx
│   └── PropertyMap.tsx       # Client-only Leaflet map
└── lib/
    ├── prisma.ts             # Prisma singleton
    ├── prediction.ts         # AI price model
    └── utils.ts              # Helpers, suburb coords
```

---

## Deploying to Netlify

1. Push to GitHub
2. Connect repo to Netlify
3. Set **Build command**: `npm run build`
4. Set **Publish directory**: `.next`
5. Add environment variables in Netlify dashboard:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
6. Deploy!

The `netlify.toml` and `@netlify/plugin-nextjs` are already configured.

---

## Upgrading the AI Model

The prediction model is in `src/lib/prediction.ts`. It uses a weighted linear regression with Mutare-specific base prices.

To upgrade to a real ML model:
1. Train a model in Python (scikit-learn, XGBoost, etc.) on real Mutare rental data
2. Deploy it as a FastAPI microservice (e.g., Railway or Render free tier)
3. Replace the `POST /api/predict` route to call that microservice instead

---

## Database Scripts

```bash
npm run db:migrate    # Apply migrations to production
npm run db:seed       # Seed with sample Mutare properties
npm run db:studio     # Open Prisma Studio (visual DB editor)
```
