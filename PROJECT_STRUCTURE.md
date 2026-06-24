# Project Structure

This document describes the current structure of the CRM demo and the responsibility of each major area.

## Overview

The project is a Next.js App Router CRM demo with:

- Locale-prefixed routes under `app/[locale]`
- `next-intl` for translations and locale navigation
- Session-based authentication
- CRM workspace pages for multiple objects and views
- Prisma persistence with seeded fallback data
- Nested Shadow DOM boundaries for UI isolation

## Root Structure

```txt
.
├── app/
├── components/
├── i18n/
├── lib/
├── messages/
├── prisma/
├── middleware.ts
├── next.config.js
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── README.md
├── PROJECT_STRUCTURE.md
├── ROLE_PERMISSIONS.md
├── SHADOW_DOM_GUIDE.md
└── SHADOW_DOM_STRUCTURE.md
```

## `app/`

Purpose: Next.js App Router entry point for layouts, pages, loading states, and API routes.

### `app/[locale]/`

Purpose: Locale-aware application entry.

Key files:

```txt
app/[locale]/layout.tsx
app/[locale]/page.tsx
app/[locale]/loading.tsx
app/[locale]/login/page.tsx
```

- `layout.tsx`: Wraps the app with `NextIntlClientProvider`, validates locale params, and loads messages.
- `page.tsx`: Locale root route.
- `loading.tsx`: Locale-level loading state.
- `login/page.tsx`: Public login page.

### `app/[locale]/app/`

Purpose: Authenticated CRM workspace routes.

Key files:

```txt
app/[locale]/app/layout.tsx
app/[locale]/app/page.tsx
app/[locale]/app/loading.tsx
app/[locale]/app/home/page.tsx
app/[locale]/app/leads/page.tsx
app/[locale]/app/leads/[id]/page.tsx
app/[locale]/app/accounts/page.tsx
app/[locale]/app/accounts/[id]/page.tsx
app/[locale]/app/contacts/page.tsx
app/[locale]/app/contacts/[id]/page.tsx
app/[locale]/app/opportunities/page.tsx
app/[locale]/app/opportunities/[id]/page.tsx
app/[locale]/app/opportunities/kanban/page.tsx
app/[locale]/app/activities/page.tsx
app/[locale]/app/reports/page.tsx
```

- `layout.tsx`: Requires the authenticated user, loads CRM data and owner lists, computes permissions, and wraps children with `AppShell` and `CrmStateProvider`.
- `page.tsx`: Entry route for `/app` inside the selected locale.
- `loading.tsx`: CRM app loading state.
- Remaining page files are thin route adapters that pass `view` and optional `recordId` into `CrmWorkspaceShell`.

### `app/api/`

Purpose: Server API routes used by the client workspace.

```txt
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/me/route.ts
app/api/crm/records/route.ts
app/api/crm/activities/route.ts
app/api/crm/leads/convert/route.ts
```

Auth routes:

- `auth/login`: Validates credentials and creates a session.
- `auth/logout`: Clears the current session.
- `auth/me`: Returns the authenticated user.

CRM routes:

- `crm/records`: Create, update, clone, transfer owner, and delete CRM records depending on permissions.
- `crm/activities`: Create and update activities.
- `crm/leads/convert`: Convert a lead into downstream CRM entities.

## `components/`

Purpose: UI and state management for the shell, CRM workspace, forms, views, and Shadow DOM helpers.

### `components/app-shell/`

Purpose: Top-level authenticated shell.

Key file:

```txt
components/app-shell/AppShell.tsx
```

`AppShell` renders:

- Header with brand and global search input
- Locale switch
- Profile and logout area
- CRM navigation tabs
- Shadow DOM level 1 and level 2 boundaries

Current boundaries in this file:

```txt
crm-app-shell      level 1
crm-main-content   level 2
```

### `components/crm/`

Purpose: CRM state, workspace shell, views, forms, and modals.

Key files:

```txt
components/crm/CrmStateProvider.tsx
components/crm/CrmWorkspaceShell.tsx
components/crm/CrmWorkspace.tsx
components/crm/workspace/CrmWorkspaceView.tsx
components/crm/workspace/CrmWorkspaceModals.tsx
components/crm/views/*.tsx
components/crm/forms/*.tsx
components/crm/modals/*.tsx
```

Responsibilities:

- `CrmStateProvider.tsx`: Holds client-side CRM data, permissions, current user, database state, and owner lists in React context.
- `CrmWorkspaceShell.tsx`: Thin adapter from route pages into `CrmWorkspace`.
- `CrmWorkspace.tsx`: Main client workspace orchestration and interactions.
- `workspace/CrmWorkspaceView.tsx`: Selects and renders the appropriate CRM surface for the active view.
- `workspace/CrmWorkspaceModals.tsx`: Central modal container for record actions.
- `views/`: Concrete screens such as accounts, contacts, leads, opportunities, activities, and reports.
- `forms/`: CRM object form fields and object-specific forms.
- `modals/`: Delete, convert lead, and record modals.

Current CRM view boundary:

```txt
crm-view-surface   level 3
```

Modal and toast behavior is intentionally kept outside the level 3 boundary and inside the level 2 area to avoid overlay issues.

### `components/i18n/`

Purpose: Locale-related UI components.

Key file:

```txt
components/i18n/LanguageSwitch.tsx
```

- `LanguageSwitch.tsx`: Switches between `en` and `ja` by replacing the locale path prefix in the current URL.

### `components/shadow/`

Purpose: Shared Shadow DOM infrastructure.

Key file:

```txt
components/shadow/ShadowBoundary.tsx
```

`ShadowBoundary`:

- Creates an open shadow root
- Creates a mount node for portal rendering
- Copies document CSS into the shadow root
- Rewrites `:root` to `:host` so CSS variables continue to work
- Exposes stable `data-testid` hooks for automation

### `components/ui/`

Purpose: Generic UI utilities.

- `LoadingIndicator.tsx`: Small loading indicator used in UX flows such as logout.

## `i18n/`

Purpose: Locale configuration and localized navigation helpers.

```txt
i18n/routing.ts
i18n/navigation.ts
i18n/request.ts
```

- `routing.ts`: Supported locales and routing config.
- `navigation.ts`: Locale-aware `Link`, router, and pathname helpers.
- `request.ts`: `next-intl` request integration.

## `messages/`

Purpose: Translation dictionaries.

```txt
messages/en.json
messages/ja.json
```

These files hold UI messages used across the shell and CRM workspace.

## `lib/`

Purpose: Shared server logic, data access, auth, seed data, and core types.

```txt
lib/auth.ts
lib/crm-data.ts
lib/prisma.ts
lib/seed.ts
lib/types.ts
```

- `auth.ts`: Session helpers, auth enforcement, role labels, and permission checks.
- `crm-data.ts`: CRM data loading, Prisma integration, seed fallback, and owner lookup.
- `prisma.ts`: Prisma client singleton.
- `seed.ts`: Demo CRM data used when the database is not configured.
- `types.ts`: Shared CRM types for records, views, and UI state.

## `prisma/`

Purpose: Database schema and seed logic.

```txt
prisma/schema.prisma
prisma/seed.ts
```

- `schema.prisma`: Models for users, sessions, CRM entities, and supporting enums.
- `seed.ts`: Creates demo data for database-backed environments.

## Tooling Notes

### `.kilo/`

Project-local Kilo configuration, agents, and skills.

### `.next/`

Generated Next.js build output. Do not edit manually.

### `node_modules/`

Installed dependencies.
