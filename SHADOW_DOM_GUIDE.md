# Shadow DOM Guide

Huong dan nay mo ta cach tao va su dung Shadow DOM trong project CRM hien tai.

## Kien Truc Hien Tai

Project dang dung `ShadowBoundary` tai:

```txt
components/shadow/ShadowBoundary.tsx
```

Component nay:

- Tao Shadow Root bang `attachShadow({ mode: "open" })`.
- Render React children vao Shadow Root bang `createPortal`.
- Dong bo CSS hien tai tu `document.styleSheets` vao Shadow Root.
- Giu Next.js router context vi van nam trong React tree chinh.

He thong dang co 3 cap Shadow DOM:

```txt
crm-app-shell      Level 1: app shell, header, navigation
crm-main-content   Level 2: main content area
crm-view-surface   Level 3: CRM page/view surface
```

## Khi Nao Nen Tao Shadow DOM Moi

Nen tao Shadow DOM moi khi can:

- Cach ly CSS cho mot khu vuc UI lon.
- Mo phong Salesforce Lightning/Web Components.
- Bao ve component khoi global CSS ben ngoai.
- Tao boundary ro rang cho mot module CRM moi.

Khong nen tao Shadow DOM moi cho:

- Button nho, label, icon rieng le.
- Component can ke thua style global truc tiep ma khong co ly do cach ly.
- Modal/toast neu co nguy co bi loi stacking context hoac fixed positioning.

## Cach Tao Boundary Moi

Import `ShadowBoundary`:

```tsx
import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";
```

Wrap khu vuc can cach ly:

```tsx
<ShadowBoundary
  name="crm-new-module"
  level={3}
  dataTestId="shadow-crm-new-module"
>
  <section className="page-stack" data-testid="page-new-module">
    ...
  </section>
</ShadowBoundary>
```

Quy uoc dat ten:

```txt
name:       kebab-case, co prefix crm-
dataTestId: shadow- + name
level:      1 | 2 | 3
```

Vi du:

```tsx
<ShadowBoundary name="crm-report-widget" level={3} dataTestId="shadow-crm-report-widget">
  <ReportWidget />
</ShadowBoundary>
```

## Y Nghia Level

Dung `level` de document ro tang Shadow DOM:

```txt
level={1}: shell lon nhat cua app
level={2}: workspace/main content
level={3}: page, widget, panel, module nghiep vu
```

Vi du nested 3 cap:

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

## CSS Trong Shadow DOM

`ShadowBoundary` hien tai tu dong copy CSS tu document vao Shadow Root.

Dieu nay giup:

- Khong phai copy `globals.css` bang tay.
- Giu UI hien tai khong bi mat style.
- Chi can maintain style tai `app/globals.css`.

Neu them class moi, cu viet CSS nhu binh thuong trong `app/globals.css`:

```css
.new-panel {
  border: 1px solid var(--line);
  border-radius: 22px;
  background: var(--card);
}
```

Sau do su dung trong component ben trong Shadow DOM:

```tsx
<div className="new-panel">...</div>
```

## Luu Y Ve Modal Va Toast

Khong nen wrap modal/toast qua nhieu cap Shadow DOM neu khong can thiet.

Ly do:

- `position: fixed` co the bi anh huong boi host/container.
- `z-index` co the kho debug hon khi nested sau nhieu Shadow Root.
- Overlay nen nam o boundary gan workspace de on dinh hon.

Trong project hien tai:

```txt
CRM view nam trong level 3
Modal/toast nam ngoai level 3, nhung van ben trong level 2
```

Day la cach can bang giua nested Shadow DOM va UI overlay on dinh.

## Automation Va Test Selector

Shadow DOM dang dung `mode: "open"`, nen co the query qua `shadowRoot`.

Vi du browser query:

```js
document
  .querySelector('[data-testid="shadow-crm-app-shell"]')
  .shadowRoot
  .querySelector('[data-testid="app-shell"]');
```

Neu can query sau 3 cap:

```js
const level1 = document.querySelector('[data-testid="shadow-crm-app-shell"]').shadowRoot;
const level2 = level1.querySelector('[data-testid="shadow-crm-main-content"]').shadowRoot;
const level3 = level2.querySelector('[data-testid="shadow-crm-view-surface"]').shadowRoot;

level3.querySelector('[data-testid="page-home"]');
```

Playwright co the pierce open Shadow DOM bang locator thong thuong trong nhieu truong hop:

```ts
await page.getByTestId("page-home").isVisible();
```

Neu test runner khong tu pierce Shadow DOM, query tung `shadowRoot` nhu vi du tren.

## Checklist Khi Them Shadow DOM Moi

Truoc khi commit, kiem tra:

- Boundary co `name` ro rang va unique.
- Boundary co `dataTestId` de automation tim duoc.
- Khong dua modal/toast vao nested boundary neu khong can.
- UI desktop/mobile van dung layout.
- `npm.cmd run typecheck` pass.
- `npm.cmd run build` pass.

## Command Validate

Tren Windows PowerShell, neu `npm` bi chan do execution policy, dung `npm.cmd`:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## Pattern Khuyen Dung

Tao boundary o cap module/page, khong tao qua day dac:

```tsx
export function NewCrmModule() {
  return (
    <ShadowBoundary name="crm-new-module" level={3} dataTestId="shadow-crm-new-module">
      <section className="page-stack" data-testid="page-new-module">
        <ObjectHeader title="New Module" subtitle="A maintainable CRM module." />
        <div className="list-card">...</div>
      </section>
    </ShadowBoundary>
  );
}
```

Nguyen tac chinh: **Shadow DOM dung de tao boundary lon, ro rang, de maintain; khong dung cho moi element nho.**
