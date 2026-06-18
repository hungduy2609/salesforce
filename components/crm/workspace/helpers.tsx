import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { opportunityStages } from "@/lib/seed";
import type { OwnerUser } from "@/lib/crm-data";
import type {
  Account,
  Activity,
  ActivityType,
  Contact,
  CrmData,
  CrmObject,
  Lead,
  Opportunity,
  OpportunityStage,
  ViewName
} from "@/lib/types";
import type {
  Actions,
  ConvertLeadResult,
  ConvertLeadValues,
  CrmPermissions,
  CurrentUser,
  FieldDef,
  PersistableRecord,
  RecordItem,
  RecordMode,
  SortState
} from "./types";
import { objectMeta } from "./types";

export function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  const t = useTranslations("common");
  return (
    <article className={`summary-card ${tone}`} data-testid={`summary-${slug(label)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{t("updated", { date: today() })}</small>
    </article>
  );
}

export function ObjectHeader({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const t = useTranslations("common");
  return (
    <div className="object-header" data-testid={`header-${slug(title)}`}>
      <div>
        <p className="eyebrow">{t("objectListView")}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="object-actions">{children}</div>
    </div>
  );
}

export function ActivityPanel({ title, activities, data, actions }: { title: string; activities: Activity[]; data: CrmData; actions?: Actions }) {
  const t = useTranslations("common");
  return (
    <section className="activity-panel" data-testid={`activity-${slug(title)}`}>
      <h2>{title}</h2>
      {activities.length ? activities.map((activity) => (
        <article className="timeline-item" key={activity.id} data-testid="activity-item">
          <span className={`status-dot ${activity.status.toLowerCase()}`} />
          <div>
            <strong>{activity.subject}</strong>
            <p>{activity.description}</p>
            <small>{activity.dueDate} by {activity.createdBy} / {activity.type} / {relatedLabel(activity, data)}</small>
          </div>
          {actions ? <button className="icon-button" aria-label={t("delete")} onClick={() => actions.openDelete("activity", activity.id, activity.subject)}>×</button> : null}
        </article>
      )) : <p className="muted">{t("noActivities")}</p>}
    </section>
  );
}

export function EmptyState({ object, onCreate }: { object: string; onCreate?: () => void }) {
  const t = useTranslations("crm");
  return (
    <div className="empty-state" data-testid="empty-state">
      <strong>{t("empty.title", { object: object.toLowerCase() })}</strong>
      <p>{onCreate ? t("empty.withCreate") : t("empty.withoutCreate")}</p>
      {onCreate ? <button className="button primary" onClick={onCreate}>{t("list.newRecord", { object })}</button> : null}
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  const locale = useLocale() as Locale;
  return <span className={`badge ${slug(value)}`}>{translateValue(value, locale)}</span>;
}

export function tableHead(object: CrmObject, sort: SortState, onSort: (key: string) => void, locale: Locale) {
  const columns = {
    account: [["name", "Account Name"], ["industry", "Industry"], ["website", "Website"], ["phone", "Phone"], ["owner", "Owner"], ["createdAt", "Created Date"]],
    contact: [["name", "Name"], ["account", "Account"], ["title", "Title"], ["email", "Email"], ["status", "Status"], ["owner", "Owner"]],
    lead: [["name", "Name"], ["company", "Company"], ["title", "Title"], ["email", "Email"], ["source", "Lead Source"], ["status", "Status"], ["owner", "Owner"]],
    opportunity: [["name", "Opportunity Name"], ["account", "Account"], ["stage", "Stage"], ["amount", "Amount"], ["closeDate", "Close Date"], ["owner", "Owner"]]
  }[object];
  return <tr><th><input aria-label={translateValue("Select all rows", locale)} type="checkbox" /></th>{columns.map(([key, label]) => <th key={key}><button onClick={() => onSort(key)}>{translateValue(label, locale)}{sort.key === key ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</button></th>)}<th>{translateValue("Actions", locale)}</th></tr>;
}

export function tableRow(object: CrmObject, record: RecordItem, data: CrmData, actions: Actions, permissions: CrmPermissions, locale: Locale) {
  const meta = objectMeta[object];
  const href = `${meta.listPath}/${record.id}`;
  const cells = tableCells(object, record, data);
  return (
    <tr key={record.id} data-testid={`row-${meta.test}`}>
      <td><input aria-label={translateValue("Select {record}", locale).replace("{record}", displayName(object, record, data))} type="checkbox" /></td>
      {cells.map((cell, index) => (
        <td key={`${record.id}-${cell.label}`} data-testid={index === 0 ? `cell-${meta.test}-name` : undefined}>
          {index === 0 ? <Link href={href}>{cell.value}</Link> : cell.badge ? <Badge value={cell.value} /> : cell.value}
        </td>
      ))}
      <td>
        <div className="row-actions" data-testid={`row-actions-${meta.test}`}>
          <Link className="mini-link" href={href}>{translateValue("View", locale)}</Link>
          {permissions.canWrite ? <button onClick={() => actions.openEdit(object, record.id)}>{translateValue("Edit", locale)}</button> : null}
          {permissions.canDelete ? <button onClick={() => actions.openDelete(object, record.id, displayName(object, record, data))}>{translateValue("Delete", locale)}</button> : null}
        </div>
      </td>
    </tr>
  );
}

export function tableCells(object: CrmObject, record: RecordItem, data: CrmData) {
  if (object === "account") {
    const account = record as Account;
    return [
      { label: "name", value: account.name }, { label: "industry", value: account.industry, badge: true }, { label: "website", value: account.website },
      { label: "phone", value: account.phone }, { label: "owner", value: account.owner }, { label: "createdAt", value: account.createdAt }
    ];
  }
  if (object === "contact") {
    const contact = record as Contact;
    return [
      { label: "name", value: fullName(contact) }, { label: "account", value: accountName(contact.accountId, data) }, { label: "title", value: contact.title },
      { label: "email", value: contact.email }, { label: "status", value: contact.status, badge: true }, { label: "owner", value: contact.owner }
    ];
  }
  if (object === "lead") {
    const lead = record as Lead;
    return [
      { label: "name", value: fullName(lead) }, { label: "company", value: lead.company }, { label: "title", value: lead.title },
      { label: "email", value: lead.email }, { label: "source", value: lead.source }, { label: "status", value: lead.status, badge: true }, { label: "owner", value: lead.owner }
    ];
  }
  const opportunity = record as Opportunity;
  return [
    { label: "name", value: opportunity.name }, { label: "account", value: accountName(opportunity.accountId, data) }, { label: "stage", value: opportunity.stage, badge: true },
    { label: "amount", value: currency(opportunity.amount) }, { label: "closeDate", value: opportunity.closeDate }, { label: "owner", value: opportunity.owner }
  ];
}

export function formFields(object: CrmObject, data: CrmData, values: Record<string, string> | undefined, ownerUsers: OwnerUser[], canTransferOwner: boolean): FieldDef[] {
  const accountOptions = data.accounts.map((account) => ({ value: account.id, label: account.name }));
  const ownerField = selectField("owner", "Owner", ownerOptions(ownerUsers, values?.owner), true, false, !canTransferOwner, canTransferOwner ? "" : "Only managers and admins can change Owner.");
  const selectedAccountId = values?.accountId;
  const contacts = object === "opportunity" && selectedAccountId
    ? data.contacts.filter((contact) => contact.accountId === selectedAccountId)
    : data.contacts;
  const contactOptions = [{ value: "", label: "None" }, ...contacts.map((contact) => ({ value: contact.id, label: fullName(contact) }))];
  if (object === "account") return [field("name", "Account Name", "text", true), field("industry", "Industry"), field("website", "Website", "url"), field("phone", "Phone"), ownerField];
  if (object === "contact") return [field("firstName", "First Name"), field("lastName", "Last Name", "text", true), selectField("accountId", "Account", accountOptions, true), field("title", "Title"), field("department", "Department"), field("email", "Email", "email", true), field("phone", "Phone"), field("mobile", "Mobile"), selectField("status", "Status", ["Active", "Inactive"].map(option), true), ownerField];
  if (object === "lead") return [field("firstName", "First Name"), field("lastName", "Last Name", "text", true), field("company", "Company", "text", true), field("title", "Title"), field("email", "Email", "email"), field("phone", "Phone"), field("source", "Lead Source"), selectField("status", "Status", ["New", "Working", "Qualified", "Converted", "Lost"].map(option), true), ownerField];
  return [field("name", "Opportunity Name", "text", true, true), selectField("accountId", "Account", accountOptions, true), selectField("contactId", "Contact", contactOptions), field("amount", "Amount", "number", true), selectField("stage", "Stage", opportunityStages.map(option), true), field("closeDate", "Close Date", "date", true), ownerField];
}

export function formDefaults(object: CrmObject, source: RecordItem | undefined, data: CrmData, mode: string, currentUser: CurrentUser): Record<string, string> {
  const suffix = mode === "clone" ? " Copy" : "";
  const defaultOwner = currentUser.name;
  if (object === "account") {
    const record = source as Account | undefined;
    return { name: record ? `${record.name}${suffix}` : "", industry: record?.industry ?? "", website: record?.website ?? "", phone: record?.phone ?? "", owner: mode === "create" ? defaultOwner : record?.owner ?? defaultOwner };
  }
  if (object === "contact") {
    const record = source as Contact | undefined;
    return { firstName: record?.firstName ?? "", lastName: record ? `${record.lastName}${suffix}` : "", accountId: record?.accountId ?? data.accounts[0]?.id ?? "", title: record?.title ?? "", department: record?.department ?? "", email: record?.email ?? "", phone: record?.phone ?? "", mobile: record?.mobile ?? "", status: record?.status ?? "Active", owner: mode === "create" ? defaultOwner : record?.owner ?? defaultOwner };
  }
  if (object === "lead") {
    const record = source as Lead | undefined;
    return { firstName: record?.firstName ?? "", lastName: record ? `${record.lastName}${suffix}` : "", company: record?.company ?? "", title: record?.title ?? "", email: record?.email ?? "", phone: record?.phone ?? "", source: record?.source ?? "Website", status: record?.status ?? "New", owner: mode === "create" ? defaultOwner : record?.owner ?? defaultOwner };
  }
  const record = source as Opportunity | undefined;
  return { name: record ? `${record.name}${suffix}` : "", accountId: record?.accountId ?? data.accounts[0]?.id ?? "", contactId: record?.contactId ?? "", amount: String(record?.amount ?? 0), stage: record?.stage ?? "Prospecting", closeDate: record?.closeDate ?? today(), owner: mode === "create" ? defaultOwner : record?.owner ?? defaultOwner };
}

export function validateForm(object: CrmObject, values: Record<string, string>) {
  const errors: Record<string, string> = {};
  const required = object === "account" ? ["name"] : object === "contact" ? ["lastName", "email", "accountId"] : object === "lead" ? ["lastName", "company"] : ["name", "accountId", "amount", "closeDate"];
  required.forEach((key) => { if (!values[key]?.trim()) errors[key] = "Required"; });
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid email";
  if (object === "opportunity" && Number.isNaN(Number(values.amount))) errors.amount = "Enter a valid amount";
  return errors;
}

export function detailGroups(object: CrmObject, record: RecordItem, data: CrmData, locale: Locale = "en") {
  if (object === "account") {
    const account = record as Account;
    return [{ title: translateValue("Account Information", locale), fields: [[translateValue("Account Name", locale), account.name], [translateValue("Industry", locale), account.industry], [translateValue("Website", locale), account.website], [translateValue("Phone", locale), account.phone], [translateValue("Owner", locale), account.owner]] }, { title: translateValue("System Information", locale), fields: [[translateValue("Created Date", locale), account.createdAt], [translateValue("Last Modified Date", locale), account.updatedAt]] }];
  }
  if (object === "contact") {
    const contact = record as Contact;
    return [{ title: translateValue("Personal Information", locale), fields: [[translateValue("First Name", locale), contact.firstName], [translateValue("Last Name", locale), contact.lastName], [translateValue("Title", locale), contact.title], [translateValue("Department", locale), contact.department]] }, { title: translateValue("Contact Information", locale), fields: [[translateValue("Email", locale), contact.email], [translateValue("Phone", locale), contact.phone], [translateValue("Mobile", locale), contact.mobile], [translateValue("Status", locale), translateValue(contact.status, locale)]] }, { title: translateValue("Relationship", locale), fields: [[translateValue("Account", locale), accountName(contact.accountId, data)], [translateValue("Owner", locale), contact.owner], [translateValue("Created Date", locale), contact.createdAt], [translateValue("Last Modified Date", locale), contact.updatedAt]] }];
  }
  if (object === "lead") {
    const lead = record as Lead;
    return [{ title: translateValue("Lead Information", locale), fields: [[translateValue("First Name", locale), lead.firstName], [translateValue("Last Name", locale), lead.lastName], [translateValue("Company", locale), lead.company], [translateValue("Title", locale), lead.title], [translateValue("Lead Source", locale), lead.source], [translateValue("Status", locale), translateValue(lead.status, locale)]] }, { title: translateValue("Contact Information", locale), fields: [[translateValue("Email", locale), lead.email], [translateValue("Phone", locale), lead.phone], [translateValue("Owner", locale), lead.owner], [translateValue("Created Date", locale), lead.createdAt]] }];
  }
  const opportunity = record as Opportunity;
  return [{ title: translateValue("Opportunity Information", locale), fields: [[translateValue("Name", locale), opportunity.name], [translateValue("Account", locale), accountName(opportunity.accountId, data)], [translateValue("Contact", locale), opportunity.contactId ? contactName(opportunity.contactId, data) : "-"], [translateValue("Stage", locale), translateValue(opportunity.stage, locale)], [translateValue("Amount", locale), currency(opportunity.amount)], [translateValue("Close Date", locale), opportunity.closeDate], [translateValue("Owner", locale), opportunity.owner]] }, { title: translateValue("System Information", locale), fields: [[translateValue("Created Date", locale), opportunity.createdAt], [translateValue("Last Modified Date", locale), opportunity.updatedAt]] }];
}

export function relatedSections(object: CrmObject, id: string, data: CrmData, locale: Locale = "en") {
  if (object === "account") return [
    { title: translateValue("Contacts", locale), items: data.contacts.filter((contact) => contact.accountId === id).map((contact) => ({ title: fullName(contact), meta: contact.title, href: `/app/contacts/${contact.id}` })) },
    { title: translateValue("Opportunities", locale), items: data.opportunities.filter((opportunity) => opportunity.accountId === id).map((opportunity) => ({ title: opportunity.name, meta: `${translateValue(opportunity.stage, locale)} / ${currency(opportunity.amount)}`, href: `/app/opportunities/${opportunity.id}` })) },
    { title: translateValue("Activities", locale), items: data.activities.filter((activity) => activity.relatedType === "account" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: translateValue(activity.type, locale), href: "#" })) }
  ];
  if (object === "contact") {
    const contact = findById(data.contacts, id);
    return [
      { title: translateValue("Account", locale), items: contact ? [{ title: accountName(contact.accountId, data), meta: translateValue("Primary account", locale), href: `/app/accounts/${contact.accountId}` }] : [] },
      { title: translateValue("Opportunities", locale), items: data.opportunities.filter((opportunity) => opportunity.contactId === id || opportunity.accountId === contact?.accountId).map((opportunity) => ({ title: opportunity.name, meta: `${translateValue(opportunity.stage, locale)} / ${currency(opportunity.amount)}`, href: `/app/opportunities/${opportunity.id}` })) },
      { title: translateValue("Activities", locale), items: data.activities.filter((activity) => activity.relatedType === "contact" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: translateValue(activity.type, locale), href: "#" })) }
    ];
  }
  if (object === "opportunity") {
    const opportunity = findById(data.opportunities, id);
    return [
      { title: translateValue("Account", locale), items: opportunity ? [{ title: accountName(opportunity.accountId, data), meta: translateValue("Deal account", locale), href: `/app/accounts/${opportunity.accountId}` }] : [] },
      { title: translateValue("Contact", locale), items: opportunity?.contactId ? [{ title: contactName(opportunity.contactId, data), meta: translateValue("Primary contact", locale), href: `/app/contacts/${opportunity.contactId}` }] : [] },
      { title: translateValue("Activities", locale), items: data.activities.filter((activity) => activity.relatedType === "opportunity" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: translateValue(activity.type, locale), href: "#" })) }
    ];
  }
  return [{ title: translateValue("Activities", locale), items: data.activities.filter((activity) => activity.relatedType === "lead" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: translateValue(activity.type, locale), href: "#" })) }];
}

export function keyFields(object: CrmObject, record: RecordItem, data: CrmData, locale: Locale = "en") {
  if (object === "account") { const account = record as Account; return [`${translateValue("Industry", locale)}: ${account.industry}`, `${translateValue("Phone", locale)}: ${account.phone}`, `${translateValue("Owner", locale)}: ${account.owner}`]; }
  if (object === "contact") { const contact = record as Contact; return [`${translateValue("Account", locale)}: ${accountName(contact.accountId, data)}`, `${translateValue("Title", locale)}: ${contact.title}`, `${translateValue("Owner", locale)}: ${contact.owner}`]; }
  if (object === "lead") { const lead = record as Lead; return [`${translateValue("Company", locale)}: ${lead.company}`, `${translateValue("Status", locale)}: ${translateValue(lead.status, locale)}`, `${translateValue("Owner", locale)}: ${lead.owner}`]; }
  const opportunity = record as Opportunity; return [`${translateValue("Account", locale)}: ${accountName(opportunity.accountId, data)}`, `${translateValue("Stage", locale)}: ${translateValue(opportunity.stage, locale)}`, `${translateValue("Amount", locale)}: ${currency(opportunity.amount)}`];
}

export function optionsFor(object: CrmObject, data: CrmData) {
  if (object === "account") return [...new Set(data.accounts.map((account) => account.industry))];
  if (object === "contact") return ["Active", "Inactive"];
  if (object === "lead") return ["New", "Working", "Qualified", "Converted", "Lost"];
  return opportunityStages;
}

export function filterMatch(object: CrmObject, record: RecordItem, filter: string) {
  if (object === "account") return (record as Account).industry === filter;
  if (object === "contact") return (record as Contact).status === filter;
  if (object === "lead") return (record as Lead).status === filter;
  return (record as Opportunity).stage === filter;
}

export function buildRecordChange(
  current: CrmData,
  object: CrmObject,
  mode: RecordMode,
  values: Record<string, string>,
  now: string,
  id: string | undefined,
  currentUser: CurrentUser
): { nextData: CrmData; record: PersistableRecord } {
  const owner = values.owner || currentUser.name;
  if (object === "account") {
    const record: Account = {
      id: mode === "edit" && id ? id : nextId("acc", current.accounts),
      name: values.name.trim(),
      industry: values.industry.trim(),
      website: values.website.trim(),
      phone: values.phone.trim(),
      owner: owner.trim() || currentUser.name,
      createdAt: mode === "edit" ? findById(current.accounts, id)?.createdAt ?? now : now,
      updatedAt: now
    };
    return { nextData: { ...current, accounts: upsert(current.accounts, record, mode === "edit") }, record };
  }

  if (object === "contact") {
    const record: Contact = {
      id: mode === "edit" && id ? id : nextId("con", current.contacts),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      accountId: values.accountId,
      title: values.title.trim(),
      department: values.department.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      mobile: values.mobile.trim(),
      status: values.status === "Inactive" ? "Inactive" : "Active",
      owner: owner.trim() || currentUser.name,
      createdAt: mode === "edit" ? findById(current.contacts, id)?.createdAt ?? now : now,
      updatedAt: now
    };
    return { nextData: { ...current, contacts: upsert(current.contacts, record, mode === "edit") }, record };
  }

  if (object === "lead") {
    const record: Lead = {
      id: mode === "edit" && id ? id : nextId("lead", current.leads),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      company: values.company.trim(),
      title: values.title.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      source: values.source.trim(),
      status: normalizeLeadStatus(values.status),
      owner: owner.trim() || currentUser.name,
      createdAt: mode === "edit" ? findById(current.leads, id)?.createdAt ?? now : now,
      updatedAt: now
    };
    return { nextData: { ...current, leads: upsert(current.leads, record, mode === "edit") }, record };
  }

  const record: Opportunity = {
    id: mode === "edit" && id ? id : nextId("opp", current.opportunities),
    name: values.name.trim(),
    accountId: values.accountId,
    contactId: values.contactId || undefined,
    amount: Number(values.amount || 0),
    stage: normalizeStage(values.stage),
    closeDate: values.closeDate,
    owner: owner.trim() || currentUser.name,
    createdAt: mode === "edit" ? findById(current.opportunities, id)?.createdAt ?? now : now,
    updatedAt: now
  };
  return { nextData: { ...current, opportunities: upsert(current.opportunities, record, mode === "edit") }, record };
}

export async function saveRecordToDatabase(object: CrmObject, record: PersistableRecord, setToast: (value: string) => void, onSynced?: () => void) {
  try {
    const response = await fetch("/api/crm/records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object, record })
    });
    if (!response.ok) throw new Error("Failed to persist record");
    onSynced?.();
  } catch {
    setToast("Saved locally, database sync failed");
  }
}

export async function deleteFromDatabase(object: CrmObject | "activity", id: string, setToast: (value: string) => void, onSynced?: () => void) {
  try {
    const response = await fetch("/api/crm/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ object, id })
    });
    if (!response.ok) throw new Error("Failed to delete record");
    onSynced?.();
  } catch {
    setToast("Deleted locally, database sync failed");
  }
}

export async function saveActivityToDatabase(activity: Activity, setToast: (value: string) => void, onSynced?: () => void) {
  try {
    const response = await fetch("/api/crm/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity)
    });
    if (!response.ok) throw new Error("Failed to persist activity");
    onSynced?.();
  } catch {
    setToast("Activity saved locally, database sync failed");
  }
}

export async function convertLeadInDatabase(values: ConvertLeadValues, setToast: (value: string) => void): Promise<ConvertLeadResult | null> {
  try {
    const response = await fetch("/api/crm/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: values.leadId,
        accountMode: values.accountMode,
        accountId: values.accountMode === "existing" ? values.accountId : undefined,
        accountName: values.accountMode === "new" ? values.accountName : undefined,
        createOpportunity: values.createOpportunity,
        opportunityName: values.createOpportunity ? values.opportunityName : undefined,
        amount: values.createOpportunity ? Number(values.amount || 0) : undefined,
        closeDate: values.createOpportunity ? values.closeDate : undefined
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "Failed to convert lead");
    }

    return (await response.json()) as ConvertLeadResult;
  } catch (error) {
    setToast(error instanceof Error ? error.message : "Lead conversion failed");
    return null;
  }
}

export function buildLocalLeadConversion(data: CrmData, lead: Lead, values: ConvertLeadValues): ConvertLeadResult {
  const now = today();
  const account = values.accountMode === "existing"
    ? findById(data.accounts, values.accountId) ?? data.accounts[0]
    : {
        id: nextId("acc", data.accounts),
        name: values.accountName.trim() || lead.company,
        industry: "Converted Lead",
        website: "",
        phone: lead.phone,
        owner: lead.owner,
        createdAt: now,
        updatedAt: now
      } satisfies Account;

  const contact: Contact = {
    id: nextId("con", data.contacts),
    firstName: lead.firstName,
    lastName: lead.lastName,
    accountId: account.id,
    title: lead.title,
    department: "",
    email: lead.email,
    phone: lead.phone,
    mobile: "",
    status: "Active",
    owner: lead.owner,
    createdAt: now,
    updatedAt: now
  };

  const opportunity: Opportunity | null = values.createOpportunity
    ? {
        id: nextId("opp", data.opportunities),
        name: values.opportunityName.trim() || `${lead.company} Opportunity`,
        accountId: account.id,
        contactId: contact.id,
        amount: Number(values.amount || 0),
        stage: "Prospecting",
        closeDate: values.closeDate || now,
        owner: lead.owner,
        createdAt: now,
        updatedAt: now
      }
    : null;

  return {
    lead: { ...lead, status: "Converted", updatedAt: now },
    account,
    contact,
    opportunity
  };
}

export function applyLeadConversion(current: CrmData, result: ConvertLeadResult): CrmData {
  const hasAccount = current.accounts.some((account) => account.id === result.account.id);
  const hasContact = current.contacts.some((contact) => contact.id === result.contact.id);

  return {
    ...current,
    leads: current.leads.map((lead) => lead.id === result.lead.id ? result.lead : lead),
    accounts: hasAccount
      ? current.accounts.map((account) => account.id === result.account.id ? result.account : account)
      : [result.account, ...current.accounts],
    contacts: hasContact
      ? current.contacts.map((contact) => contact.id === result.contact.id ? result.contact : contact)
      : [result.contact, ...current.contacts],
    opportunities: result.opportunity ? [result.opportunity, ...current.opportunities] : current.opportunities
  };
}

export function collectionKey(object: CrmObject): "accounts" | "contacts" | "leads" | "opportunities" { return object === "account" ? "accounts" : object === "contact" ? "contacts" : object === "lead" ? "leads" : "opportunities"; }
export function recordsForObject(data: CrmData, object: CrmObject): RecordItem[] { return data[collectionKey(object)] as RecordItem[]; }
export function detailObjectForView(view: ViewName): CrmObject { return view.startsWith("account") ? "account" : view.startsWith("contact") ? "contact" : view.startsWith("lead") ? "lead" : "opportunity"; }
export function findById<T extends { id: string }>(records: T[], id?: string) { return records.find((record) => record.id === id); }
export function upsert<T extends { id: string }>(records: T[], next: T, replace: boolean) { return replace ? records.map((record) => record.id === next.id ? next : record) : [next, ...records]; }
export function nextId(prefix: string, records: { id: string }[]) { return `${prefix}-${String(records.length + 1).padStart(3, "0")}-${Date.now().toString(36).slice(-4)}`; }
export function fullName(record: { firstName: string; lastName: string }) { return `${record.firstName} ${record.lastName}`.trim(); }
export function displayName(object: CrmObject, record: RecordItem, data: CrmData) { if (object === "account") return (record as Account).name; if (object === "opportunity") return (record as Opportunity).name; if (object === "contact") return fullName(record as Contact); return fullName(record as Lead); }
export function accountName(id: string, data: CrmData) { return findById(data.accounts, id)?.name ?? "Unknown Account"; }
export function contactName(id: string, data: CrmData) { const contact = findById(data.contacts, id); return contact ? fullName(contact) : "Unknown Contact"; }
export function ownerOptions(ownerUsers: OwnerUser[], selectedOwner?: string) {
  const options = ownerUsers.map((user) => ({ value: user.name, label: `${user.name} - ${user.roleLabel}` }));
  if (selectedOwner && !options.some((option) => option.value === selectedOwner)) {
    return [{ value: selectedOwner, label: `${selectedOwner} - Existing Owner` }, ...options];
  }
  return options;
}
export function relatedLabel(activity: Activity, data: CrmData) { const record = findById(recordsForObject(data, activity.relatedType), activity.relatedId); return record ? displayName(activity.relatedType, record, data) : "Detached record"; }
export function activityRelatedHref(activity: Activity) { return `${objectMeta[activity.relatedType].listPath}/${activity.relatedId}`; }
export function activitySearchText(activity: Activity, data: CrmData) { return `${activity.subject} ${activity.description} ${activity.type} ${activity.status} ${activity.createdBy} ${relatedLabel(activity, data)} ${activity.relatedType}`.toLowerCase(); }
export function searchableText(object: CrmObject, record: RecordItem, data: CrmData) { return `${displayName(object, record, data)} ${tableCells(object, record, data).map((cell) => cell.value).join(" ")}`.toLowerCase(); }
export function sortRecords(object: CrmObject, a: RecordItem, b: RecordItem, sort: SortState, data: CrmData) { const av = sortValue(object, a, sort.key, data); const bv = sortValue(object, b, sort.key, data); return sort.direction === "asc" ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true }); }
export function sortValue(object: CrmObject, record: RecordItem, key: string, data: CrmData) { const cell = tableCells(object, record, data).find((item) => item.label === key); return cell?.value ?? ""; }
export function sortActivities(a: Activity, b: Activity, sort: SortState, data: CrmData) { const av = activitySortValue(a, sort.key, data); const bv = activitySortValue(b, sort.key, data); return sort.direction === "asc" ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true }); }
export function activitySortValue(activity: Activity, key: string, data: CrmData) { if (key === "related") return relatedLabel(activity, data); return String(activity[key as keyof Activity] ?? ""); }
export function firstRelatedId(data: CrmData, object: CrmObject) { return recordsForObject(data, object)[0]?.id ?? ""; }
export function normalizeCrmObject(value: string): CrmObject { return (["lead", "account", "contact", "opportunity"] as string[]).includes(value) ? value as CrmObject : "lead"; }
export function normalizeActivityType(value: string): ActivityType { return (["Call", "Task", "Note", "Email"] as string[]).includes(value) ? value as ActivityType : "Task"; }
export function normalizeLeadStatus(value: string): Lead["status"] { return ["New", "Working", "Qualified", "Converted", "Lost"].includes(value) ? value as Lead["status"] : "New"; }
export function normalizeStage(value: string): OpportunityStage { return opportunityStages.includes(value as OpportunityStage) ? value as OpportunityStage : "Prospecting"; }
export function defaultActivitySubject(type: ActivityType) { return type === "Call" ? "Called customer" : type === "Task" ? "Follow up" : type === "Email" ? "Sent email" : "Added note"; }
export function currency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }
export function today() { return new Date().toISOString().slice(0, 10); }
export function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function capitalize(value: string) { return `${value.charAt(0).toUpperCase()}${value.slice(1)}`; }
export function translateValue(value: string, locale: Locale) { return locale === "ja" ? japaneseLabels[value] ?? value : value; }

function field(name: string, label: string, type = "text", required = false, full = false): FieldDef { return { name, label, type, required, full, options: [] }; }
function selectField(name: string, label: string, options: { value: string; label: string }[], required = false, full = false, disabled = false, help?: string): FieldDef { return { name, label, type: "select", required, full, disabled, help, options }; }
function option(value: string) { return { value, label: value }; }

const japaneseLabels: Record<string, string> = {
  "Actions": "操作",
  "View": "表示",
  "Edit": "編集",
  "Delete": "削除",
  "Clone": "複製",
  "Create": "作成",
  "New": "新規",
  "Required": "必須です",
  "Enter a valid email": "有効なメールアドレスを入力してください",
  "Enter a valid amount": "有効な金額を入力してください",
  "Only managers and admins can change Owner.": "所有者の変更はマネージャーと管理者のみ可能です。",
  "Select all rows": "すべての行を選択",
  "Select {record}": "{record}を選択",
  "Account": "取引先",
  "Accounts": "取引先",
  "Account Name": "取引先名",
  "Account Information": "取引先情報",
  "Activities": "活動",
  "Activity": "活動",
  "Amount": "金額",
  "Assigned To": "担当者",
  "Close Date": "完了予定日",
  "Company": "会社",
  "Contact": "取引先責任者",
  "Contacts": "取引先責任者",
  "Contact Information": "連絡先情報",
  "Created Date": "作成日",
  "Deal account": "商談の取引先",
  "Department": "部署",
  "Due Date": "期限日",
  "Email": "メール",
  "First Name": "名",
  "Industry": "業種",
  "Last Modified Date": "最終更新日",
  "Last Name": "姓",
  "Lead": "リード",
  "Leads": "リード",
  "Lead Information": "リード情報",
  "Lead Source": "リードソース",
  "Mobile": "携帯電話",
  "Name": "名前",
  "Opportunity": "商談",
  "Opportunities": "商談",
  "Opportunity Information": "商談情報",
  "Opportunity Name": "商談名",
  "Owner": "所有者",
  "Personal Information": "個人情報",
  "Phone": "電話",
  "Primary account": "主取引先",
  "Primary contact": "主取引先責任者",
  "Related To": "関連先",
  "Relationship": "関係",
  "Stage": "ステージ",
  "Status": "ステータス",
  "Subject": "件名",
  "System Information": "システム情報",
  "Title": "役職",
  "Type": "種別",
  "Website": "Webサイト",
  "Active": "有効",
  "Inactive": "無効",
  "Working": "対応中",
  "Qualified": "見込みあり",
  "Converted": "変換済み",
  "Lost": "失注",
  "Open": "未完了",
  "Completed": "完了",
  "Call": "通話",
  "Task": "タスク",
  "Note": "メモ",
  "Prospecting": "見込み調査",
  "Qualification": "評価",
  "Needs Analysis": "ニーズ分析",
  "Value Proposition": "価値提案",
  "Proposal/Price Quote": "提案/見積",
  "Negotiation/Review": "交渉/レビュー",
  "Closed Won": "受注",
  "Closed Lost": "失注",
  "lead": "リード",
  "leadPlural": "リード",
  "account": "取引先",
  "accountPlural": "取引先",
  "contact": "取引先責任者",
  "contactPlural": "取引先責任者",
  "opportunity": "商談",
  "opportunityPlural": "商談"
};
