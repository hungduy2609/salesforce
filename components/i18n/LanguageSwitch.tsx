"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

const languageOptions: Array<{ locale: Locale; shortLabel: string }> = [
  { locale: "en", shortLabel: "EN" },
  { locale: "ja", shortLabel: "JA" }
];

export function LanguageSwitch() {
  const locale = useLocale() as Locale;
  const t = useTranslations("language");

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const { pathname, search, hash } = window.location;
    const nextPathname = pathname.replace(/^\/(en|ja)(?=\/|$)/, `/${nextLocale}`);

    window.location.replace(`${nextPathname}${search}${hash}`);
  }

  return (
    <div className="language-switch" role="group" aria-label={t("label")} data-testid="language-switch">
      {languageOptions.map((option) => (
        <button
          key={option.locale}
          type="button"
          className={locale === option.locale ? "active" : ""}
          aria-pressed={locale === option.locale}
          title={t(option.locale)}
          onClick={() => switchLocale(option.locale)}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}
