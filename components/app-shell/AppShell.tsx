"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";

const navigation = [
  { href: "/app/home", label: "Home", testId: "nav-home" },
  { href: "/app/leads", label: "Leads", testId: "nav-leads" },
  { href: "/app/accounts", label: "Accounts", testId: "nav-accounts" },
  { href: "/app/contacts", label: "Contacts", testId: "nav-contacts" },
  { href: "/app/opportunities", label: "Opportunities", testId: "nav-opportunities" },
  { href: "/app/opportunities/kanban", label: "Kanban", testId: "nav-kanban" },
  { href: "/app/activities", label: "Activities", testId: "nav-activities" },
  { href: "/app/reports", label: "Reports", testId: "nav-reports" }
];

type AppShellUser = {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
};

export function AppShell({ children, user }: { children: React.ReactNode; user: AppShellUser }) {
  const pathname = usePathname();
  const activeHref = [...navigation]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <ShadowBoundary name="crm-app-shell" level={1} dataTestId="shadow-crm-app-shell">
      <div className="app-shell" data-testid="app-shell">
        <header className="top-header" data-testid="app-header">
          <div className="brand-zone">
            <button className="app-launcher" data-testid="btn-app-launcher" aria-label="Open app launcher">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} />
              ))}
            </button>
            <Link href="/app/home" className="brand-lockup" data-testid="link-brand-home">
              <span className="brand-cloud">CRM</span>
              <span>
                <strong>Lightning Desk</strong>
                <small>Salesforce-inspired demo</small>
              </span>
            </Link>
          </div>

          <label className="global-search" data-testid="global-search">
            <span>Search</span>
            <input data-testid="input-global-search" placeholder="Search leads, accounts, contacts..." />
          </label>

          <div className="header-actions" aria-label="Header actions">
            <button data-testid="btn-help">Help</button>
            <button data-testid="btn-settings">Settings</button>
            <div className="profile-pill" data-testid="profile-menu" title={`${user.email} - ${user.roleLabel}`}>
              <span>{user.initials}</span>
              <b>{user.name}</b>
              <small>{user.roleLabel}</small>
            </div>
            <button data-testid="btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </header>

        <nav className="app-navigation" data-testid="app-navigation" aria-label="CRM modules">
          {navigation.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link key={item.href} className={active ? "active" : ""} href={item.href} data-testid={item.testId}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ShadowBoundary name="crm-main-content" level={2} dataTestId="shadow-crm-main-content">
          <main className="main-content" data-testid="main-content">{children}</main>
        </ShadowBoundary>
      </div>
    </ShadowBoundary>
  );
}
