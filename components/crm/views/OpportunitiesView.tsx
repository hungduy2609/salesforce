"use client";

import Link from "next/link";
import { opportunityStages } from "@/lib/seed";
import type { CrmData } from "@/lib/types";
import { ObjectHeader, accountName, currency, slug } from "../workspace/helpers";
import type { Actions, CrmPermissions } from "../workspace/types";
import { ObjectRecordsView } from "./ObjectRecordsView";

export function OpportunitiesView({ recordId, kanban = false, data, actions, permissions }: { recordId?: string; kanban?: boolean; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  if (kanban) return <OpportunityKanban data={data} actions={actions} permissions={permissions} />;
  return <ObjectRecordsView object="opportunity" recordId={recordId} data={data} actions={actions} permissions={permissions} />;
}

function OpportunityKanban({ data, actions, permissions }: { data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  return (
    <section className="page-stack" data-testid="page-opportunity-kanban">
      <ObjectHeader title="Opportunity Kanban" subtitle="Deals grouped by stage with pipeline totals.">
        {permissions.canWrite ? <button className="button primary" data-testid="btn-new-opportunity" onClick={() => actions.openCreate("opportunity")}>New Opportunity</button> : null}
      </ObjectHeader>
      <div className="kanban-board" data-testid="kanban-opportunities">
        {opportunityStages.map((stage) => {
          const cards = data.opportunities.filter((opportunity) => opportunity.stage === stage);
          const total = cards.reduce((sum, opportunity) => sum + opportunity.amount, 0);
          return (
            <section className="kanban-column" key={stage} data-testid={`kanban-column-${slug(stage)}`}>
              <div className="kanban-column-header">
                <h2>{stage}</h2>
                <span>{currency(total)}</span>
              </div>
              {cards.map((opportunity) => (
                <Link className="kanban-card" href={`/app/opportunities/${opportunity.id}`} key={opportunity.id} data-testid="kanban-card-opportunity">
                  <strong>{opportunity.name}</strong>
                  <span>{currency(opportunity.amount)}</span>
                  <small>{accountName(opportunity.accountId, data)} / {opportunity.owner}</small>
                </Link>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
