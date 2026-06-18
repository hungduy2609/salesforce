"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { opportunityStages } from "@/lib/seed";
import type { CrmData } from "@/lib/types";
import { ObjectHeader, currency, translateValue } from "../workspace/helpers";

export function ReportsView({ data }: { data: CrmData }) {
  const locale = useLocale() as Locale;
  const tReports = useTranslations("reports");
  const byStage = opportunityStages.map((stage) => ({ stage, total: data.opportunities.filter((opportunity) => opportunity.stage === stage).reduce((sum, opportunity) => sum + opportunity.amount, 0) }));
  const max = Math.max(...byStage.map((item) => item.total), 1);
  return (
    <section className="page-stack" data-testid="page-reports">
      <ObjectHeader title={tReports("title")} subtitle={tReports("subtitle")}><Link className="button" href="/app/opportunities/kanban">{tReports("openKanban")}</Link></ObjectHeader>
      <div className="report-card">
        <h2>{tReports("pipelineByStage")}</h2>
        {byStage.map((item) => (
          <div className="bar-row" key={item.stage}>
            <span>{translateValue(item.stage, locale)}</span>
            <div><i style={{ width: `${Math.max(6, (item.total / max) * 100)}%` }} /></div>
            <b>{currency(item.total)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
