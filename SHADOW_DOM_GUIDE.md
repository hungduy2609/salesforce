# Shadow DOM Guide

This guide explains how Shadow DOM is used in the current CRM project and when to add new boundaries.

## Current Architecture

The project uses `ShadowBoundary` here:

```txt
components/shadow/ShadowBoundary.tsx
```

This component:

- Creates an open shadow root with `attachShadow({ mode: "open" })`
- Renders React children into the shadow root with `createPortal`
- Copies CSS from `document.styleSheets` into the shadow root
- Rewrites `:root` selectors to `:host` so CSS variables continue to work
- Preserves React and Next.js context because rendering still happens in the same React tree

The app currently uses three boundary levels:

```txt
crm-app-shell      Level 1: top-level shell
crm-main-content   Level 2: authenticated main content area
crm-view-surface   Level 3: CRM workspace surface
```

## When To Add A New Boundary

Add a new boundary when you need:

- CSS isolation for a large UI region
- A clear module-level encapsulation point
- Stable Shadow DOM structure for automation
- A Salesforce-like component boundary

Do not add a new boundary for:

- Small leaf components such as buttons or icons
- Simple UI that should inherit global layout naturally
- Overlays that rely on stable stacking or fixed positioning unless there is a clear reason

## Current Placement Strategy

The current structure is:

- `AppShell` owns level 1 and level 2 boundaries
- `CrmWorkspace` owns the level 3 boundary
- Modals and toast-like overlays should stay outside level 3 and inside level 2

This reduces the chance of `position: fixed`, clipping, and z-index issues.

## Creating A New Boundary

Import `ShadowBoundary`:

```tsx
import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";
```

Wrap the target region:

```tsx
<ShadowBoundary
  name="crm-new-module"
  level={3}
  dataTestId="shadow-crm-new-module"
>
  <section data-testid="page-new-module">
    ...
  </section>
</ShadowBoundary>
```

Naming rules:

```txt
name:       kebab-case, preferably with a crm- prefix
dataTestId: shadow- + name
level:      1 | 2 | 3
```

Example:

```tsx
<ShadowBoundary name="crm-report-widget" level={3} dataTestId="shadow-crm-report-widget">
  <ReportWidget />
</ShadowBoundary>
```

## Level Meaning

The `level` prop documents structural intent.

```txt
level={1}: outer application shell
level={2}: authenticated workspace content region
level={3}: page, module, or business surface
```

Nested example:

```tsx
<ShadowBoundary name="crm-app-shell" level={1}>
  <AppShellContent>
    <ShadowBoundary name="crm-main-content" level={2}>
      <main>
        <ShadowBoundary name="crm-view-surface" level={3}>
          <CrmView />
        </ShadowBoundary>
      </main>
    </ShadowBoundary>
  </AppShellContent>
</ShadowBoundary>
```

## CSS Behavior Inside Shadow DOM

`ShadowBoundary` automatically syncs document styles into the shadow root.

This means:

- Global app CSS continues to work inside shadow trees
- New styles can still be authored in `app/globals.css`
- CSS variables remain available because `:root` is rewritten to `:host`

Example global CSS:

```css
.new-panel {
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--card);
}
```

Usage inside a shadow boundary:

```tsx
<div className="new-panel">...</div>
```

## Automation Notes

The component uses `mode: "open"`, so automation can query through `shadowRoot` when needed.

Example:

```js
document
  .querySelector('[data-testid="shadow-crm-app-shell"]')
  .shadowRoot
  .querySelector('[data-testid="app-shell"]');
```

Three-level traversal:

```js
const level1 = document.querySelector('[data-testid="shadow-crm-app-shell"]').shadowRoot;
const level2 = level1.querySelector('[data-testid="shadow-crm-main-content"]').shadowRoot;
const level3 = level2.querySelector('[data-testid="shadow-crm-view-surface"]').shadowRoot;

level3.querySelector('[data-testid="page-home"]');
```

Many modern test tools can pierce open Shadow DOM automatically for simple selectors, but direct `shadowRoot` traversal is still the most explicit fallback.

## Checklist Before Merging

- Boundary name is clear and unique
- `data-testid` is present for automation when needed
- Overlay UI is not pushed unnecessarily deeper into nested boundaries
- Desktop and mobile layout still work
- `npm.cmd run typecheck` passes
- `npm.cmd run build` passes

## Validation Commands

On Windows, prefer `npm.cmd` if PowerShell execution policy blocks `npm`:

```powershell
npm.cmd run typecheck
npm.cmd run build
```
