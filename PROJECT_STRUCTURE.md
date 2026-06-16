# Project Structure

This document explains the current structure of the CRM demo project and the purpose of each major folder and file.

## Overview

This is a Next.js App Router CRM demo inspired by Salesforce Lightning. It includes:

- Authenticated CRM workspace under `/app/*`.
- Login and session-based authentication.
- CRM objects: leads, accounts, contacts, opportunities, activities, and reports.
- Optional Prisma-backed persistence when `DATABASE_URL` is configured.
- Seed-data fallback when no database is configured.
- Nested Shadow DOM boundaries for Salesforce-like UI encapsulation.

## Root Structure

```txt
.
├── app/
├── components/
├── lib/
├── prisma/
├── middleware.ts
├── next.config.js
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── README.md
├── ROLE_PERMISSIONS.md
├── SHADOW_DOM_GUIDE.md
└── PROJECT_STRUCTURE.md
```

## Folder Purposes

### `app/`

Purpose: Next.js App Router entry point for pages, layouts, API routes, and global CSS.

This folder controls routing and server/client boundaries.

Key files:

```txt
app/layout.tsx
app/page.tsx
app/globals.css
```

- `app/layout.tsx`: Root HTML layout. Imports `app/globals.css` and renders the document shell.
- `app/page.tsx`: Redirects the root route `/` to `/app/home`.
- `app/globals.css`: Main visual system for the app. Contains layout, cards, tables, modals, forms, buttons, responsive rules, and CSS variables.

### `app/app/`

Purpose: Authenticated CRM application routes.

All routes inside this folder are protected by `middleware.ts` and the server layout calls `requireUser()`.

Structure:

```txt
app/app/layout.tsx
app/app/page.tsx
app/app/home/page.tsx
app/app/leads/page.tsx
app/app/leads/[id]/page.tsx
app/app/accounts/page.tsx
app/app/accounts/[id]/page.tsx
app/app/contacts/page.tsx
app/app/contacts/[id]/page.tsx
app/app/opportunities/page.tsx
app/app/opportunities/[id]/page.tsx
app/app/opportunities/kanban/page.tsx
app/app/activities/page.tsx
app/app/reports/page.tsx
```

- `app/app/layout.tsx`: Authenticated CRM layout. Loads the current user and renders `AppShell`.
- `app/app/page.tsx`: Redirects `/app` to `/app/home`.
- `home/page.tsx`: CRM dashboard route.
- `leads/page.tsx`: Leads list route.
- `leads/[id]/page.tsx`: Lead detail route.
- `accounts/page.tsx`: Accounts list route.
- `accounts/[id]/page.tsx`: Account detail route.
- `contacts/page.tsx`: Contacts list route.
- `contacts/[id]/page.tsx`: Contact detail route.
- `opportunities/page.tsx`: Opportunities list route.
- `opportunities/[id]/page.tsx`: Opportunity detail route.
- `opportunities/kanban/page.tsx`: Opportunity Kanban board route.
- `activities/page.tsx`: Activities list route.
- `reports/page.tsx`: Reports route.

Most page files are intentionally thin. They should delegate data loading and UI rendering to `CrmWorkspaceShell` and `CrmWorkspace` instead of duplicating CRM logic.

### `app/login/`

Purpose: Public login page.

```txt
app/login/page.tsx
```

This page handles user login UI and calls the auth API routes.

### `app/api/`

Purpose: Server API routes used by the client UI.

Structure:

```txt
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/me/route.ts
app/api/crm/records/route.ts
app/api/crm/activities/route.ts
app/api/crm/leads/convert/route.ts
```

Auth routes:

- `auth/login`: Verifies credentials, creates a session, and sets the session cookie.
- `auth/logout`: Destroys the current session and clears the session cookie.
- `auth/me`: Returns the current authenticated user.

CRM routes:

- `crm/records`: Creates, updates, clones, and deletes CRM records.
- `crm/activities`: Creates and updates activities.
- `crm/leads/convert`: Converts a lead into account/contact/opportunity data.

### `components/`

Purpose: React UI components used by the app routes.

Structure:

```txt
components/app-shell/
components/crm/
components/shadow/
```

### `components/app-shell/`

Purpose: Application frame and top-level CRM navigation.

```txt
components/app-shell/AppShell.tsx
```

`AppShell` renders:

- Top header.
- Brand area.
- Global search.
- User/profile area.
- Module navigation.
- Main content slot.
- Shadow DOM level 1 and level 2 boundaries.

Current Shadow DOM boundaries in this file:

```txt
crm-app-shell      level 1
crm-main-content   level 2
```

### `components/crm/`

Purpose: CRM-specific server shell and client workspace.

```txt
components/crm/CrmWorkspaceShell.tsx
components/crm/CrmWorkspace.tsx
```

- `CrmWorkspaceShell.tsx`: Server component. Loads the authenticated user, CRM data, owner users, and permissions. Passes those values to `CrmWorkspace`.
- `CrmWorkspace.tsx`: Main client component for CRM UI and interactions. Contains list views, detail views, Kanban, reports, forms, modals, local state updates, and API persistence calls.

Current Shadow DOM boundary in this folder:

```txt
crm-view-surface   level 3
```

Important note: modals and toast are intentionally kept outside the level 3 boundary but still inside level 2. This reduces the risk of overlay, fixed-position, and z-index regressions.

### `components/shadow/`

Purpose: Shared Shadow DOM infrastructure.

```txt
components/shadow/ShadowBoundary.tsx
```

`ShadowBoundary`:

- Creates an open Shadow Root with `attachShadow({ mode: "open" })`.
- Uses `createPortal` so React context and Next.js routing still work.
- Copies current document styles into the Shadow Root.
- Provides stable `data-testid` values for automation.

See `SHADOW_DOM_GUIDE.md` for detailed usage patterns.

### `lib/`

Purpose: Shared business logic, server utilities, types, seed data, and database access helpers.

Structure:

```txt
lib/auth.ts
lib/crm-data.ts
lib/prisma.ts
lib/seed.ts
lib/types.ts
```

- `auth.ts`: Server-only authentication and authorization helpers. Handles password hashing, session creation, session lookup, cookie helpers, role labels, and permission checks.
- `crm-data.ts`: Data loading adapter. Reads CRM data from Prisma when `DATABASE_URL` exists, otherwise falls back to seeded in-memory data. Also maps Prisma enum values into UI-friendly CRM values.
- `prisma.ts`: Prisma client singleton/connection helper.
- `seed.ts`: Local seed CRM data and constants used when no database is configured.
- `types.ts`: Shared TypeScript types for CRM records, CRM objects, views, and UI data structures.

### `prisma/`

Purpose: Database schema and seed script.

Structure:

```txt
prisma/schema.prisma
prisma/seed.ts
```

- `schema.prisma`: Prisma schema for users, sessions, CRM records, activities, and enum definitions.
- `seed.ts`: Database seed script that creates demo CRM data and users.

### `.kilo/`

Purpose: Project-local Kilo configuration, commands, agents, and skills.

This folder is tooling configuration. It is not part of the runtime application.

### `.next/`

Purpose: Generated Next.js build output and type metadata.

Do not edit this folder manually. It is regenerated by commands such as:

```powershell
npm.cmd run build
```

### `node_modules/`

Purpose: Installed dependencies.

Do not edit this folder manually.

## Root Files

### `middleware.ts`

Purpose: Route-level auth protection.

It checks for the `sf_session` cookie and redirects unauthenticated `/app/*` requests to `/login`.

### `package.json`

Purpose: Project metadata, dependencies, and scripts.

Important scripts:

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"typecheck": "tsc --noEmit",
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev",
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by execution policy:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

### `tsconfig.json`

Purpose: TypeScript configuration for strict Next.js TypeScript checking.

### `next.config.js`

Purpose: Next.js configuration.

### `prisma.config.ts`

Purpose: Prisma CLI/configuration entry point.

### `README.md`

Purpose: General project documentation.

### `ROLE_PERMISSIONS.md`

Purpose: Documents role-based permissions and expected access behavior.

### `SHADOW_DOM_GUIDE.md`

Purpose: Documents how to create and use new Shadow DOM boundaries in this project.

### `PROJECT_STRUCTURE.md`

Purpose: This file. Documents the current folder and file structure.

## Runtime Flow

Typical authenticated page flow:

```txt
Browser requests /app/home
middleware.ts checks sf_session cookie
app/app/layout.tsx calls requireUser()
AppShell renders the CRM frame
CrmWorkspaceShell loads CRM data and permissions
CrmWorkspace renders the selected CRM view
```

## Data Flow

CRM data is loaded through `lib/crm-data.ts`:

```txt
DATABASE_URL configured
  -> load records from Prisma

DATABASE_URL missing
  -> use structured clone of lib/seed.ts data
```

Client-side CRM changes are handled in `CrmWorkspace.tsx`. If database mode is enabled, changes are also sent to API routes under `app/api/crm/*`.

## Authentication Flow

```txt
Login page
  -> app/api/auth/login
  -> createSession()
  -> set sf_session cookie
  -> /app/* routes become accessible
```

Logout flow:

```txt
AppShell logout button
  -> app/api/auth/logout
  -> destroyCurrentSession()
  -> clear sf_session cookie
  -> redirect to /login
```

## Shadow DOM Flow

Current nesting:

```txt
ShadowBoundary: crm-app-shell (level 1)
  AppShell UI
  ShadowBoundary: crm-main-content (level 2)
    main.main-content
      CrmWorkspace
        ShadowBoundary: crm-view-surface (level 3)
          current CRM page/view
        modal/toast overlays
```

This mirrors a Salesforce-like layered component model while keeping the existing React and Next.js structure maintainable.

## Maintenance Guidelines

- Keep route files thin; put CRM behavior in `CrmWorkspaceShell` or `CrmWorkspace`.
- Keep shared business types in `lib/types.ts`.
- Keep server-only auth logic in `lib/auth.ts`.
- Keep Prisma mapping and database fallback logic in `lib/crm-data.ts`.
- Keep reusable Shadow DOM logic in `components/shadow/ShadowBoundary.tsx`.
- Do not duplicate large CSS blocks inside components; use `app/globals.css` unless a component has a strong reason for local styles.
- Do not manually edit `.next/` or `node_modules/`.
