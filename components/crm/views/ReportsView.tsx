import Link from "next/link";
import { opportunityStages } from "@/lib/seed";
import type { CrmData } from "@/lib/types";
import { ObjectHeader, currency } from "../workspace/helpers";

export function ReportsView({ data }: { data: CrmData }) {
  const byStage = opportunityStages.map((stage) => ({ stage, total: data.opportunities.filter((opportunity) => opportunity.stage === stage).reduce((sum, opportunity) => sum + opportunity.amount, 0) }));
  const max = Math.max(...byStage.map((item) => item.total), 1);
  return (
    <section className="page-stack" data-testid="page-reports">
      <ObjectHeader title="Reports" subtitle="Mock summary reports for pipeline and workload."><Link className="button" href="/app/opportunities/kanban">Open Kanban</Link></ObjectHeader>
      <div className="report-card">
        <h2>Pipeline by Stage</h2>
        {byStage.map((item) => (
          <div className="bar-row" key={item.stage}>
            <span>{item.stage}</span>
            <div><i style={{ width: `${Math.max(6, (item.total / max) * 100)}%` }} /></div>
            <b>{currency(item.total)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
