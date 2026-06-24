# Shadow DOM Structure

This document describes the current Shadow DOM render flow and how boundaries are applied in the CRM app.

## Main File

```txt
components/shadow/ShadowBoundary.tsx
```

`ShadowBoundary` creates the project's Shadow DOM boundaries. It:

- Creates an open `shadowRoot`
- Creates a mount node inside the shadow root
- Renders children into that mount node with `createPortal`
- Copies CSS from `document.styleSheets`
- Rewrites `:root` to `:host` so variables still work in the shadow tree

## Current Render Flow

For a locale-aware CRM page such as accounts:

```txt
app/[locale]/app/accounts/page.tsx
  -> CrmWorkspaceShell
    -> CrmWorkspace
      -> ShadowBoundary name="crm-view-surface" level={3}
        -> CrmWorkspaceView
```

The outer app shell layers are created higher in the route layout:

```txt
app/[locale]/app/layout.tsx
  -> AppShell
    -> ShadowBoundary name="crm-app-shell" level={1}
      -> ShadowBoundary name="crm-main-content" level={2}
        -> route children
```

## Current Boundary Map

```txt
crm-app-shell      level 1
crm-main-content   level 2
crm-view-surface   level 3
```

## Resulting DOM Shape

A level 3 workspace boundary renders roughly like this:

```txt
div[data-shadow-boundary="crm-view-surface"][data-shadow-level="3"]
  #shadow-root (open)
    style#crm-shadow-styles
    div[data-shadow-mount="crm-view-surface"]
      CrmWorkspaceView content
```

## `ShadowBoundary` Props

```tsx
type ShadowBoundaryProps = {
  children: ReactNode;
  name: string;
  level: 1 | 2 | 3;
  className?: string;
  dataTestId?: string;
  style?: CSSProperties;
};
```

Meaning:

- `name`: Boundary identifier used in `data-shadow-boundary` and `data-shadow-mount`
- `level`: Structural level marker used for attributes and base styling
- `className`: Class on the host element outside the shadow root
- `dataTestId`: Test selector for the host element
- `style`: Inline style for the host element

## Base Shadow Styles

`ShadowBoundary` injects base styles into every shadow root:

```css
:host {
  display: block;
  min-width: 0;
  color: var(--text, #172033);
  font-family: var(--font-body, Candara, "Segoe UI", Verdana, sans-serif);
}

:host([data-shadow-level="1"]) {
  min-height: 100vh;
}

:host([data-shadow-level="2"]),
:host([data-shadow-level="3"]) {
  width: 100%;
}
```

The actual implementation also applies base box-sizing and form-control inheritance rules.

## Adding A New CRM Page

If the page belongs to the CRM workspace, keep the route thin and delegate to `CrmWorkspaceShell`.

```tsx
import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function LeadsPage() {
  return <CrmWorkspaceShell view="leads" />;
}
```

Requirements:

- The `view` must exist in `ViewName`
- `CrmWorkspaceView` must support that view
- You do not need another boundary if `CrmWorkspace` already wraps the surface

## Adding A Custom Page With Shadow DOM

If a page does not use the CRM workspace but still needs CSS isolation, create a client component and wrap it directly.

```tsx
"use client";

import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";

export function NewPageClient() {
  return (
    <ShadowBoundary name="new-page-surface" level={3} dataTestId="shadow-new-page-surface">
      <main>New page content</main>
    </ShadowBoundary>
  );
}
```

Then render it from the route file.

## Adding A New Level

If the project ever needs another formal level, update the prop type in `ShadowBoundary.tsx` and extend the base styling for that level.

Example:

```tsx
level: 1 | 2 | 3 | 4;
```

And extend styles accordingly:

```css
:host([data-shadow-level="2"]),
:host([data-shadow-level="3"]),
:host([data-shadow-level="4"]) {
  width: 100%;
}
```

`level` does not create nesting on its own. Real nesting only happens when one `ShadowBoundary` is rendered inside another.

## Usage Rules

- Use `AppShell` to provide level 1 and level 2 structure
- Use `CrmWorkspace` to provide the standard level 3 CRM surface
- Use `ShadowBoundary` directly only for custom isolated surfaces
- Keep boundary names unique within the same UI region
- Add new levels only when layout behavior or tooling truly requires them
