import Link from "next/link";
import type { ReactNode } from "react";
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
  return (
    <article className={`summary-card ${tone}`} data-testid={`summary-${slug(label)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Updated {today()}</small>
    </article>
  );
}

export function ObjectHeader({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="object-header" data-testid={`header-${slug(title)}`}>
      <div>
        <p className="eyebrow">Object list view</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="object-actions">{children}</div>
    </div>
  );
}

export function ActivityPanel({ title, activities, data, actions }: { title: string; activities: Activity[]; data: CrmData; actions?: Actions }) {
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
          {actions ? <button className="icon-button" aria-label="Delete activity" onClick={() => actions.openDelete("activity", activity.id, activity.subject)}>×</button> : null}
        </article>
      )) : <p className="muted">No activities found.</p>}
    </section>
  );
}

export function EmptyState({ object, onCreate }: { object: string; onCreate?: () => void }) {
  return (
    <div className="empty-state" data-testid="empty-state">
      <strong>No {object.toLowerCase()} records found</strong>
      <p>{onCreate ? "Try changing your filters or create a new record." : "Try changing your filters or ask a manager for edit access."}</p>
      {onCreate ? <button className="button primary" onClick={onCreate}>New {object}</button> : null}
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  return <span className={`badge ${slug(value)}`}>{value}</span>;
}

export function tableHead(object: CrmObject, sort: SortState, onSort: (key: string) => void) {
  const columns = {
    account: [["name", "Account Name"], ["industry", "Industry"], ["website", "Website"], ["phone", "Phone"], ["owner", "Owner"], ["createdAt", "Created Date"]],
    contact: [["name", "Name"], ["account", "Account"], ["title", "Title"], ["email", "Email"], ["status", "Status"], ["owner", "Owner"]],
    lead: [["name", "Name"], ["company", "Company"], ["title", "Title"], ["email", "Email"], ["source", "Lead Source"], ["status", "Status"], ["owner", "Owner"]],
    opportunity: [["name", "Opportunity Name"], ["account", "Account"], ["stage", "Stage"], ["amount", "Amount"], ["closeDate", "Close Date"], ["owner", "Owner"]]
  }[object];
  return <tr><th><input aria-label="Select all rows" type="checkbox" /></th>{columns.map(([key, label]) => <th key={key}><button onClick={() => onSort(key)}>{label}{sort.key === key ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</button></th>)}<th>Actions</th></tr>;
}

export function tableRow(object: CrmObject, record: RecordItem, data: CrmData, actions: Actions, permissions: CrmPermissions) {
  const meta = objectMeta[object];
  const href = `${meta.listPath}/${record.id}`;
  const cells = tableCells(object, record, data);
  return (
    <tr key={record.id} data-testid={`row-${meta.test}`}>
      <td><input aria-label={`Select ${displayName(object, record, data)}`} type="checkbox" /></td>
      {cells.map((cell, index) => (
        <td key={`${record.id}-${cell.label}`} data-testid={index === 0 ? `cell-${meta.test}-name` : undefined}>
          {index === 0 ? <Link href={href}>{cell.value}</Link> : cell.badge ? <Badge value={cell.value} /> : cell.value}
        </td>
      ))}
      <td>
        <div className="row-actions" data-testid={`row-actions-${meta.test}`}>
          <Link className="mini-link" href={href}>View</Link>
          {permissions.canWrite ? <button onClick={() => actions.openEdit(object, record.id)}>Edit</button> : null}
          {permissions.canDelete ? <button onClick={() => actions.openDelete(object, record.id, displayName(object, record, data))}>Delete</button> : null}
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
  const ownerField = selectField("owner", "Owner", ownerOptions(ownerUsers, values?.owner), true, false, !canTransferOwner, canTransferOwner ? "Salesforce-style record owner assignment." : "Only managers and admins can change Owner.");
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

export function detailGroups(object: CrmObject, record: RecordItem, data: CrmData) {
  if (object === "account") {
    const account = record as Account;
    return [{ title: "Account Information", fields: [["Account Name", account.name], ["Industry", account.industry], ["Website", account.website], ["Phone", account.phone], ["Owner", account.owner]] }, { title: "System Information", fields: [["Created Date", account.createdAt], ["Last Modified Date", account.updatedAt]] }];
  }
  if (object === "contact") {
    const contact = record as Contact;
    return [{ title: "Personal Information", fields: [["First Name", contact.firstName], ["Last Name", contact.lastName], ["Title", contact.title], ["Department", contact.department]] }, { title: "Contact Information", fields: [["Email", contact.email], ["Phone", contact.phone], ["Mobile", contact.mobile], ["Status", contact.status]] }, { title: "Relationship", fields: [["Account", accountName(contact.accountId, data)], ["Owner", contact.owner], ["Created Date", contact.createdAt], ["Last Modified Date", contact.updatedAt]] }];
  }
  if (object === "lead") {
    const lead = record as Lead;
    return [{ title: "Lead Information", fields: [["First Name", lead.firstName], ["Last Name", lead.lastName], ["Company", lead.company], ["Title", lead.title], ["Lead Source", lead.source], ["Status", lead.status]] }, { title: "Contact Information", fields: [["Email", lead.email], ["Phone", lead.phone], ["Owner", lead.owner], ["Created Date", lead.createdAt]] }];
  }
  const opportunity = record as Opportunity;
  return [{ title: "Opportunity Information", fields: [["Name", opportunity.name], ["Account", accountName(opportunity.accountId, data)], ["Contact", opportunity.contactId ? contactName(opportunity.contactId, data) : "-"], ["Stage", opportunity.stage], ["Amount", currency(opportunity.amount)], ["Close Date", opportunity.closeDate], ["Owner", opportunity.owner]] }, { title: "System Information", fields: [["Created Date", opportunity.createdAt], ["Last Modified Date", opportunity.updatedAt]] }];
}

export function relatedSections(object: CrmObject, id: string, data: CrmData) {
  if (object === "account") return [
    { title: "Contacts", items: data.contacts.filter((contact) => contact.accountId === id).map((contact) => ({ title: fullName(contact), meta: contact.title, href: `/app/contacts/${contact.id}` })) },
    { title: "Opportunities", items: data.opportunities.filter((opportunity) => opportunity.accountId === id).map((opportunity) => ({ title: opportunity.name, meta: `${opportunity.stage} / ${currency(opportunity.amount)}`, href: `/app/opportunities/${opportunity.id}` })) },
    { title: "Activities", items: data.activities.filter((activity) => activity.relatedType === "account" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: activity.type, href: "#" })) }
  ];
  if (object === "contact") {
    const contact = findById(data.contacts, id);
    return [
      { title: "Account", items: contact ? [{ title: accountName(contact.accountId, data), meta: "Primary account", href: `/app/accounts/${contact.accountId}` }] : [] },
      { title: "Opportunities", items: data.opportunities.filter((opportunity) => opportunity.contactId === id || opportunity.accountId === contact?.accountId).map((opportunity) => ({ title: opportunity.name, meta: `${opportunity.stage} / ${currency(opportunity.amount)}`, href: `/app/opportunities/${opportunity.id}` })) },
      { title: "Activities", items: data.activities.filter((activity) => activity.relatedType === "contact" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: activity.type, href: "#" })) }
    ];
  }
  if (object === "opportunity") {
    const opportunity = findById(data.opportunities, id);
    return [
      { title: "Account", items: opportunity ? [{ title: accountName(opportunity.accountId, data), meta: "Deal account", href: `/app/accounts/${opportunity.accountId}` }] : [] },
      { title: "Contact", items: opportunity?.contactId ? [{ title: contactName(opportunity.contactId, data), meta: "Primary contact", href: `/app/contacts/${opportunity.contactId}` }] : [] },
      { title: "Activities", items: data.activities.filter((activity) => activity.relatedType === "opportunity" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: activity.type, href: "#" })) }
    ];
  }
  return [{ title: "Activities", items: data.activities.filter((activity) => activity.relatedType === "lead" && activity.relatedId === id).map((activity) => ({ title: activity.subject, meta: activity.type, href: "#" })) }];
}

export function keyFields(object: CrmObject, record: RecordItem, data: CrmData) {
  if (object === "account") { const account = record as Account; return [`Industry: ${account.industry}`, `Phone: ${account.phone}`, `Owner: ${account.owner}`]; }
  if (object === "contact") { const contact = record as Contact; return [`Account: ${accountName(contact.accountId, data)}`, `Title: ${contact.title}`, `Owner: ${contact.owner}`]; }
  if (object === "lead") { const lead = record as Lead; return [`Company: ${lead.company}`, `Status: ${lead.status}`, `Owner: ${lead.owner}`]; }
  const opportunity = record as Opportunity; return [`Account: ${accountName(opportunity.accountId, data)}`, `Stage: ${opportunity.stage}`, `Amount: ${currency(opportunity.amount)}`];
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

function field(name: string, label: string, type = "text", required = false, full = false): FieldDef { return { name, label, type, required, full, options: [] }; }
function selectField(name: string, label: string, options: { value: string; label: string }[], required = false, full = false, disabled = false, help?: string): FieldDef { return { name, label, type: "select", required, full, disabled, help, options }; }
function option(value: string) { return { value, label: value }; }
