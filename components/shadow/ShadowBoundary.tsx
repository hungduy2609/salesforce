"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ShadowBoundaryProps = {
  children: ReactNode;
  name: string;
  level: 1 | 2 | 3;
  className?: string;
  dataTestId?: string;
  style?: CSSProperties;
};

const SHADOW_STYLE_ID = "crm-shadow-styles";

const shadowBaseStyles = `
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

:host, :host *, :host *::before, :host *::after {
  box-sizing: border-box;
}

:host a {
  color: inherit;
  text-decoration: none;
}

:host button,
:host input,
:host select,
:host textarea {
  font: inherit;
}

:host button {
  cursor: pointer;
}

:host button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
`;

export function ShadowBoundary({ children, name, level, className, dataTestId, style }: ShadowBoundaryProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    let mount = shadowRoot.querySelector<HTMLDivElement>("[data-shadow-mount]");

    if (!mount) {
      mount = document.createElement("div");
      mount.setAttribute("data-shadow-mount", name);
      shadowRoot.appendChild(mount);
    }

    syncShadowStyles(shadowRoot);
    setMountNode(mount);
  }, [name]);

  return (
    <div
      ref={hostRef}
      className={className}
      data-shadow-boundary={name}
      data-shadow-level={level}
      data-testid={dataTestId}
      style={style}
    >
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}

function syncShadowStyles(shadowRoot: ShadowRoot) {
  let style = shadowRoot.getElementById(SHADOW_STYLE_ID) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = SHADOW_STYLE_ID;
    shadowRoot.prepend(style);
  }

  const nextStyles = `${shadowBaseStyles}\n${collectDocumentStyles()}`;
  if (style.textContent !== nextStyles) {
    style.textContent = nextStyles;
  }
}

function collectDocumentStyles() {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n")
    .replace(/:root/g, ":host");
}
