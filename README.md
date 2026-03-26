# PhdFit Admin Console

Operations dashboard for the PhdFit platform. Provides admin tools for data quality monitoring, crawler management, taxonomy governance, signal review, user analytics, LLM cost tracking, and system health monitoring.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (base-ui backed)
- **Icons**: lucide-react
- **Charts**: recharts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the admin console.

## Project Structure

```
src/
  app/
    admin/
      page.tsx              # Dashboard overview (KPIs, data coverage, free tier usage)
      layout.tsx            # Admin layout with sidebar
      professors/page.tsx   # Professor data management (CRUD, search, completeness tracking)
      crawler/page.tsx      # Crawler & pipeline monitoring (jobs, cron tasks, data coverage)
      taxonomy/page.tsx     # Taxonomy manager (tree view, add/merge tags)
      signals/page.tsx      # Signal quality review (confirm/reject, accuracy stats)
      users/page.tsx        # User management & analytics (KPIs, search behavior)
      llm/page.tsx          # LLM cost & quality monitor (usage, breakdowns by model/purpose)
      system/page.tsx       # System health (services, free tier usage, queue status)
  components/
    admin/
      admin-sidebar.tsx     # Navigation sidebar
    ui/                     # shadcn/ui components
  lib/
    mock-data.ts            # Mock data for all modules
    utils.ts                # Shared utilities (cn, isSafeUrl, formatDate)
  types/
    admin.ts                # TypeScript type definitions
  middleware.ts             # Auth middleware (protects /admin/* routes)
```

## Admin Modules

| Module | Route | Description |
|--------|-------|-------------|
| Overview | `/admin` | Dashboard with KPI cards, data coverage, free tier usage |
| Professors | `/admin/professors` | Professor data table with search, filters, completeness tracking |
| Crawler | `/admin/crawler` | Crawl job monitoring, cron task scheduling, data coverage stats |
| Taxonomy | `/admin/taxonomy` | Topic/Method taxonomy tree, usage stats, add/merge operations |
| Signals | `/admin/signals` | Recruiting/funding signal review with confirm/reject workflow |
| Users | `/admin/users` | User list, KPI analytics, search behavior analysis |
| LLM Costs | `/admin/llm` | Token usage, cost breakdowns by model and purpose |
| System Health | `/admin/system` | Service status, free tier resource usage, task queue monitoring |

## Security

- **Auth Middleware**: All `/admin/*` routes protected by `src/middleware.ts` (dev mode bypasses for convenience)
- **Security Headers**: HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy configured in `next.config.ts`
- **URL Validation**: External URLs validated with `isSafeUrl()` before rendering as links

## Current Status

All pages use **mock data** (`src/lib/mock-data.ts`). Backend API integration is pending.

### Review Findings (Resolved)

| Severity | Finding | Status |
|----------|---------|--------|
| CRITICAL | No auth on admin routes | Fixed (middleware.ts) |
| HIGH | Missing security headers | Fixed (next.config.ts) |
| HIGH | Unvalidated external URLs | Fixed (isSafeUrl) |
| HIGH | Signal expandedId cross-tab bug | Fixed |
| HIGH | React.ReactNode import missing | Fixed |

### Remaining Items (Medium/Low)

- Extract shared `StatusDot` and `DataCoverage` components
- Add server-side pagination when connected to real API
- Implement CSRF strategy before adding mutations
- Add PII masking to Users table before real data
- Add `eslint-plugin-security`

## Deployment

Designed for **Vercel** deployment. In the full PhdFit architecture, this is deployed as a separate Next.js project at the `/admin` subdomain or path.

```bash
npm run build   # Verify production build
```
