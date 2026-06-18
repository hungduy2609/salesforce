"use client";

import { useTranslations } from "next-intl";
import type { CrmData, ViewName } from "@/lib/types";
import { AccountsView } from "../views/AccountsView";
import { ActivitiesView } from "../views/ActivitiesView";
import { ContactsView } from "../views/ContactsView";
import { LeadsView } from "../views/LeadsView";
import { OpportunitiesView } from "../views/OpportunitiesView";
import { ReportsView } from "../views/ReportsView";
import { ActivityPanel, SummaryCard, currency } from "./helpers";
import type { Actions, CrmPermissions } from "./types";

type WorkspaceViewProps = {
  view: ViewName;
  recordId?: string;
  data: CrmData;
  actions: Actions;
  permissions: CrmPermissions;
};

export function CrmWorkspaceView({ view, recordId, data, actions, permissions }: WorkspaceViewProps) {
  if (view === "home") return <HomeDashboard data={data} actions={actions} permissions={permissions} />;
  if (view === "leads") return <LeadsView data={data} actions={actions} permissions={permissions} />;
  if (view === "lead-detail") return <LeadsView recordId={recordId} data={data} actions={actions} permissions={permissions} />;
  if (view === "accounts") return <AccountsView data={data} actions={actions} permissions={permissions} />;
  if (view === "account-detail") return <AccountsView recordId={recordId} data={data} actions={actions} permissions={permissions} />;
  if (view === "contacts") return <ContactsView data={data} actions={actions} permissions={permissions} />;
  if (view === "contact-detail") return <ContactsView recordId={recordId} data={data} actions={actions} permissions={permissions} />;
  if (view === "opportunities") return <OpportunitiesView data={data} actions={actions} permissions={permissions} />;
  if (view === "opportunity-detail") return <OpportunitiesView recordId={recordId} data={data} actions={actions} permissions={permissions} />;
  if (view === "opportunity-kanban") return <OpportunitiesView kanban data={data} actions={actions} permissions={permissions} />;
  if (view === "activities") return <ActivitiesView data={data} actions={actions} permissions={permissions} />;
  return <ReportsView data={data} />;
}

function HomeDashboard({ data, actions, permissions }: { data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  const t = useTranslations("home");
  const openDeals = data.opportunities.filter((opportunity) => !opportunity.stage.startsWith("Closed"));
  const pipeline = openDeals.reduce((sum, opportunity) => sum + opportunity.amount, 0);
  const recent = [...data.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const upcoming = data.activities.filter((activity) => activity.status === "Open").slice(0, 4);

  return (
    <section className="page-stack" data-testid="page-home">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </div>
        {permissions.canWrite ? (
          <div className="quick-actions" data-testid="home-quick-actions">
            <button className="button primary" data-testid="btn-new-lead" onClick={() => actions.openCreate("lead")}>{t("newLead")}</button>
            <button className="button" data-testid="btn-new-contact" onClick={() => actions.openCreate("contact")}>{t("newContact")}</button>
            <button className="button" data-testid="btn-new-opportunity" onClick={() => actions.openCreate("opportunity")}>{t("newOpportunity")}</button>
          </div>
        ) : null}
      </div>

      <div className="summary-grid" data-testid="summary-cards">
        <SummaryCard label={t("totalLeads")} value={data.leads.length.toString()} tone="blue" />
        <SummaryCard label={t("accounts")} value={data.accounts.length.toString()} tone="mint" />
        <SummaryCard label={t("openDeals")} value={openDeals.length.toString()} tone="amber" />
        <SummaryCard label={t("revenuePipeline")} value={currency(pipeline)} tone="violet" />
      </div>

      <div className="two-column">
        <ActivityPanel title={t("recentActivities")} activities={recent} data={data} />
        <ActivityPanel title={t("upcomingTasks")} activities={upcoming} data={data} />
      </div>
    </section>
  );
}
