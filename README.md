# Salesforce Lightning Inspired CRM Demo

A lightweight CRM demo built with Next.js, TypeScript, Prisma, and `next-intl`.

## Features

- Locale-aware routes: `en`, `ja`
- Session-based authentication
- CRM modules: Home, Leads, Accounts, Contacts, Opportunities, Activities, Reports
- Opportunity Kanban
- Lead conversion
- Role-based permissions
- Prisma database mode with seeded fallback data
- Stable `data-testid` selectors
- Shadow DOM boundaries for UI isolation

## Requirements

- Node.js 18.18+ or 20+
- npm
- PostgreSQL for login and persistent data

## Install

```cmd
npm install
```

## Environment

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
```

## Database Setup

```cmd
npm run db:generate
npm run db:push
npm run db:seed
```

## Run

```cmd
npm run dev
```

Open:

```txt
http://localhost:3000/en/login
```

Routes always require a locale prefix such as `/en` or `/ja`.

## Demo Accounts

Password for all accounts:

```txt
demo-password
```

| Email | Role |
| --- | --- |
| `admin@example.com` | System Administrator |
| `manager@example.com` | Sales Manager |
| `duy@example.com` | Sales Rep |
| `readonly@example.com` | Read Only |

## Notes

- Login only works when `DATABASE_URL` is configured.
- Without a database, the app can still use local seed data for UI/demo purposes.
- Session cookie name is `sf_session`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build the app |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data and users |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```txt
app/
components/
i18n/
lib/
messages/
prisma/
```

## Related Docs

- `PROJECT_STRUCTURE.md`
- `ROLE_PERMISSIONS.md`
- `SHADOW_DOM_GUIDE.md`
- `SHADOW_DOM_STRUCTURE.md`
