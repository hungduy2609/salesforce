# Shadow DOM Structure

This document describes how Shadow DOM is currently used in the project and how to add a new page or level.

## Main File

```txt
components/shadow/ShadowBoundary.tsx
```

`ShadowBoundary` is the component used to create a Shadow DOM boundary. It does the following:

- Creates a `shadowRoot` with `host.attachShadow({ mode: "open" })`.
- Creates a mount node inside the shadow root.
- Renders React children into the shadow root with `createPortal`.
- Copies CSS from `document.styleSheets` into the shadow root.
- Replaces `:root` with `:host` so CSS variables can work inside the shadow tree.

## Current Render Flow

```txt
app/app/accounts/page.tsx
  -> CrmWorkspaceShell
    -> CrmWorkspace
      -> ShadowBoundary name="crm-view-surface" level={3}
        -> CrmWorkspaceView
```

Example of an existing CRM page:

```tsx
import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function AccountsPage() {
  return <CrmWorkspaceShell view="accounts" />;
}
```

Inside `CrmWorkspace`, the view is wrapped with Shadow DOM:

```tsx
<ShadowBoundary name="crm-view-surface" level={3} dataTestId="shadow-crm-view-surface">
  <CrmWorkspaceView
    view={controller.view}
    recordId={controller.recordId}
    data={controller.data}
    actions={controller.actions}
    permissions={controller.permissions}
  />
</ShadowBoundary>
```

## Resulting DOM Structure

In the browser, the structure is roughly:

```txt
div[data-shadow-boundary="crm-view-surface"][data-shadow-level="3"]
  #shadow-root (open)
    style#crm-shadow-styles
    div[data-shadow-mount="crm-view-surface"]
      CrmWorkspaceView content
```

## ShadowBoundary Props

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

- `name`: Boundary name, used for `data-shadow-boundary` and the mount node.
- `level`: Shadow level. Currently this is only an attribute used for level-based styling.
- `className`: Class assigned to the host element outside the shadow root.
- `dataTestId`: Test id for the host element.
- `style`: Inline style for the host element.

## Base CSS Inside Shadow DOM

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

## Adding a New CRM Page

If the new page uses the CRM workspace, only use `CrmWorkspaceShell`:

```tsx
import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function LeadsPage() {
  return <CrmWorkspaceShell view="leads" />;
}
```

Requirements:

- `leads` must exist in `ViewName`.
- `CrmWorkspaceView` must handle the `leads` view.
- You do not need to wrap the page with another `ShadowBoundary` because `CrmWorkspace` already does it.

## Adding a Custom Page With Shadow DOM

If the new page does not use the CRM workspace, create a client component and wrap it with `ShadowBoundary`:

```tsx
"use client";

import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";

export function NewPageClient() {
  return (
    <ShadowBoundary name="new-page-surface" level={3}>
      <main>
        New page content
      </main>
    </ShadowBoundary>
  );
}
```

Then import the client component from the server page:

```tsx
import { NewPageClient } from "@/components/new-page/NewPageClient";

export default function NewPage() {
  return <NewPageClient />;
}
```

## Adding a New Level

If you want to use `level={4}`, update the type in `ShadowBoundary.tsx`:

```tsx
level: 1 | 2 | 3 | 4;
```

Then add CSS for the new level:

```css
:host([data-shadow-level="2"]),
:host([data-shadow-level="3"]),
:host([data-shadow-level="4"]) {
  width: 100%;
}
```

Usage:

```tsx
<ShadowBoundary name="lead-detail-surface" level={4}>
  <LeadDetail />
</ShadowBoundary>
```

## Nested Shadow DOM

`level` does not automatically create nested shadow roots. If you need real nested Shadow DOM, wrap a `ShadowBoundary` inside another `ShadowBoundary`:

```tsx
<ShadowBoundary name="level-3-surface" level={3}>
  <section>
    Level 3 content

    <ShadowBoundary name="level-4-surface" level={4}>
      <div>Level 4 content</div>
    </ShadowBoundary>
  </section>
</ShadowBoundary>
```

Result:

```txt
level-3 host
  #shadow-root
    level-3 content
      level-4 host
        #shadow-root
          level-4 content
```

## Usage Rules

- Use `CrmWorkspaceShell` for CRM pages.
- Use `ShadowBoundary` directly for custom pages that need CSS isolation.
- Each `name` should be unique within the same UI area.
- Add a new level only when you need different style or layout behavior by level.
- If you need nested Shadow DOM, wrap another `ShadowBoundary`; do not rely on `level` alone.
