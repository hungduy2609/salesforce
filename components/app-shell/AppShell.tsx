"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import logo from "@/image/logo.png";

const navigation = [
  { href: "/app/home", labelKey: "home", testId: "nav-home" },
  { href: "/app/leads", labelKey: "leads", testId: "nav-leads" },
  { href: "/app/accounts", labelKey: "accounts", testId: "nav-accounts" },
  { href: "/app/contacts", labelKey: "contacts", testId: "nav-contacts" },
  { href: "/app/opportunities", labelKey: "opportunities", testId: "nav-opportunities" },
  { href: "/app/opportunities/kanban", labelKey: "kanban", testId: "nav-kanban" },
  { href: "/app/activities", labelKey: "activities", testId: "nav-activities" },
  { href: "/app/reports", labelKey: "reports", testId: "nav-reports" }
];

type AppShellUser = {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
};

export function AppShell({ children, user }: { children: React.ReactNode; user: AppShellUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const tBrand = useTranslations("brand");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");
  const tNav = useTranslations("nav");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const activeHref = [...navigation]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href;

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <ShadowBoundary name="crm-app-shell" level={1} dataTestId="shadow-crm-app-shell">
      <div className="app-shell" data-testid="app-shell">
        <header className="top-header" data-testid="app-header">
          <div className="brand-zone">
            <button className="app-launcher" data-testid="btn-app-launcher" aria-label={tHeader("appLauncher")}>
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} />
              ))}
            </button>
            <Link href="/app/home" className="brand-lockup" data-testid="link-brand-home">
              <Image className="brand-logo" src={logo} alt="CRM Demo logo" priority />
              <span>
                <strong style={{ fontSize: "1.5rem" }}>CRM</strong>
                <small>{tBrand("tagline")}</small>
              </span>
            </Link>
          </div>

          <label className="global-search" data-testid="global-search">
            <span>{tHeader("search")}</span>
            <input data-testid="input-global-search" placeholder={tHeader("searchPlaceholder")} />
          </label>

          <div className="header-actions" aria-label={tHeader("actions")}>
            <LanguageSwitch />
            <button data-testid="btn-help">{tHeader("help")}</button>
            <button data-testid="btn-settings">{tHeader("settings")}</button>
            <div className="profile-pill" data-testid="profile-menu" title={`${user.email} - ${user.roleLabel}`}>
              <span>{user.initials}</span>
              <b>{user.name}</b>
              <small>{user.roleLabel}</small>
            </div>
            <button data-testid="btn-logout" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <LoadingIndicator label={tCommon("loggingOut")} size="sm" /> : tHeader("logout")}
            </button>
          </div>
        </header>

        <nav className="app-navigation" data-testid="app-navigation" aria-label="CRM modules">
          {navigation.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link key={item.href} className={active ? "active" : ""} href={item.href} data-testid={item.testId}>
                {tNav(item.labelKey)}
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
