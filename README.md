# PatternVault

CS2 skin market comparison platform — compare prices across Steam, CSFloat, Skinport, Buff, DMarket, and GamerPay.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Push DB schema
npm run db:push

# 4. Seed popular skins
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `NEXTAUTH_SECRET` | ✅ | Session encryption secret |
| `NEXTAUTH_URL` | ✅ | Your app's base URL |
| `STEAM_API_KEY` | ✅ | From https://steamcommunity.com/dev/apikey |
| `CSFLOAT_API_KEY` | Optional | CSFloat marketplace API key |
| `SKINPORT_CLIENT_ID` | Optional | Skinport OAuth client ID |
| `SKINPORT_CLIENT_SECRET` | Optional | Skinport OAuth client secret |
| `BUFF_SESSION_COOKIE` | Optional | Buff163 session token |
| `DMARKET_PUBLIC_KEY` | Optional | DMarket API public key |
| `DMARKET_SECRET_KEY` | Optional | DMarket API secret key |
| `GAMERPAY_API_KEY` | Optional | GamerPay API key |
| `RESEND_API_KEY` | Optional | Email alerts via Resend |

## Architecture

```
app/                    # Next.js 15 App Router pages
  api/                  # API routes
  (auth)/login/         # Steam OpenID login
  opportunities/        # Opportunity scanner
  skin/[id]/            # Skin detail + price history
  dashboard/            # User watchlist + alerts
components/             # React components
  ui/                   # shadcn-style primitives
lib/
  marketplaces/         # Marketplace adapter pattern
    base.ts             # Abstract adapter
    steam.ts            # Steam Market
    csfloat.ts          # CSFloat
    skinport.ts         # Skinport
    buff.ts             # Buff163
    dmarket.ts          # DMarket
    gamerpay.ts         # GamerPay
    index.ts            # Registry + bulk fetch
  auth.ts               # Steam OpenID + sessions
  redis.ts              # Redis caching helpers
  prisma.ts             # Prisma client
  utils.ts              # Formatters, helpers
hooks/                  # React hooks
  useSearch.ts          # Debounced skin search
  useInfiniteScroll.ts  # Intersection observer loader
  useNotifications.ts   # Browser push notifications
prisma/
  schema.prisma         # Full DB schema
  seed.ts               # Popular skins seed data
```

## Adding a New Marketplace

1. Create `lib/marketplaces/mymarket.ts` extending `MarketplaceAdapter`
2. Implement `fetchListings(params)` 
3. Register in `lib/marketplaces/index.ts`:
   ```ts
   import { MyMarketAdapter } from "./mymarket";
   adapters.set("mymarket", new MyMarketAdapter());
   ```

## Deploy to Vercel

```bash
vercel
```

Set environment variables in the Vercel dashboard. Provision a Postgres database and Redis instance (e.g. Upstash).
