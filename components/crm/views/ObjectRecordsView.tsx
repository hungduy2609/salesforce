"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { Activity, CrmData, CrmObject, Lead } from "@/lib/types";
import {
  ActivityPanel,
  EmptyState,
  ObjectHeader,
  capitalize,
  detailGroups,
  displayName,
  filterMatch,
  findById,
  keyFields,
  optionsFor,
  recordsForObject,
  relatedSections,
  searchableText,
  sortRecords,
  tableHead,
  tableRow,
  translateValue
} from "../workspace/helpers";
import type { Actions, CrmPermissions, RecordItem, SortState } from "../workspace/types";
import { objectMeta } from "../workspace/types";

export function ObjectRecordsView({ object, recordId, data, actions, permissions }: { object: CrmObject; recordId?: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  if (recordId) return <RecordDetail object={object} id={recordId} data={data} actions={actions} permissions={permissions} />;
  return <ObjectList object={object} data={data} actions={actions} permissions={permissions} />;
}

function ObjectList({ object, data, actions, permissions }: { object: CrmObject; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");
  const tCrm = useTranslations("crm");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<SortState>({ key: "name", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const meta = objectMeta[object];
  const records = recordsForObject(data, object);
  const filterOptions = optionsFor(object, data);

  const rows = useMemo(() => {
    const searched = records.filter((record) => searchableText(object, record, data).includes(search.toLowerCase()));
    const filtered = filter === "all" ? searched : searched.filter((record) => filterMatch(object, record, filter));
    return [...filtered].sort((a, b) => sortRecords(object, a, b, sort, data));
  }, [data, filter, object, records, search, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const singular = translateObject(object, false, locale);
  const plural = translateObject(object, true, locale);

  function toggleSort(key: string) {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  return (
    <section className="page-stack" data-testid={`page-${meta.test}s`}>
      <ObjectHeader title={plural} subtitle={tCrm("list.subtitle", { count: rows.length, object: plural })}>
        {permissions.canWrite ? (
          <button className="button primary" data-testid={`btn-new-${meta.test}`} onClick={() => actions.openCreate(object)}>
            {tCrm("list.newRecord", { object: singular })}
          </button>
        ) : null}
      </ObjectHeader>

      <div className="list-card" data-testid={`list-${meta.test}s`}>
        <div className="list-toolbar" data-testid={`toolbar-${meta.test}s`}>
          <label>
            {tCommon("listView")}
            <select data-testid={`select-${meta.test}-list-view`} defaultValue="all">
              <option value="all">{tCrm("list.allObjects", { object: plural })}</option>
              <option value="mine">{tCrm("list.myObjects", { object: plural })}</option>
              <option value="recent">{tCrm("list.recentlyViewed")}</option>
            </select>
          </label>
          <label className="toolbar-search">
            {tCommon("searchThisList")}
            <input
              data-testid={`input-${meta.test}-search`}
              value={search}
              placeholder={tCrm("list.searchPlaceholder", { object: plural.toLowerCase() })}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {tCommon("filter")}
            <select
              data-testid={`select-${meta.test}-status`}
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">{tCommon("all")}</option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>{translateValue(option, locale)}</option>
              ))}
            </select>
          </label>
          <button className="button ghost" data-testid={`btn-refresh-${meta.test}`} onClick={() => setPage(1)}>{tCommon("refresh")}</button>
        </div>

        <div className="table-wrap">
          <table data-testid={`table-${meta.test}s`}>
            <thead>{tableHead(object, sort, toggleSort, locale)}</thead>
            <tbody>
              {visible.length ? visible.map((record) => tableRow(object, record, data, actions, permissions, locale)) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState object={singular} onCreate={permissions.canWrite ? () => actions.openCreate(object) : undefined} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" data-testid={`pagination-${meta.test}s`}>
          <span>{tCommon("pageOf", { page, pageCount })}</span>
          <button className="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{tCommon("previous")}</button>
          <button className="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>{tCommon("next")}</button>
        </div>
      </div>
    </section>
  );
}

function RecordDetail({ object, id, data, actions, permissions }: { object: CrmObject; id: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");
  const tCrm = useTranslations("crm");
  const [tab, setTab] = useState<"details" | "activity" | "related">("details");
  const record = findById(recordsForObject(data, object), id);
  const meta = objectMeta[object];

  if (!record) {
    const singular = translateObject(object, false, locale);
    const plural = translateObject(object, true, locale);
    return (
      <section className="page-stack" data-testid="record-not-found">
        <ObjectHeader title={tCommon("notFoundTitle", { object: singular })} subtitle={tCommon("notFoundSubtitle")}>
          <Link className="button" href={meta.listPath}>{tCommon("backTo", { object: plural })}</Link>
        </ObjectHeader>
      </section>
    );
  }

  const activities = data.activities.filter((activity) => activity.relatedType === object && activity.relatedId === id);
  const title = displayName(object, record, data);

  return (
    <section className="page-stack" data-testid={`page-${meta.test}-detail`}>
      <div className="record-header" data-testid={`record-header-${meta.test}`}>
        <div>
          <p className="breadcrumb"><Link href={meta.listPath}>{translateObject(object, true, locale)}</Link> / {title}</p>
          <p className="eyebrow">{translateObject(object, false, locale)}</p>
          <h1>{title}</h1>
          <div className="key-fields">{keyFields(object, record, data, locale).map((field) => <span key={field}>{field}</span>)}</div>
        </div>
        <div className="record-actions">
          {permissions.canWrite ? <button className="button" data-testid={`btn-edit-${meta.test}`} onClick={() => actions.openEdit(object, id)}>{tCommon("edit")}</button> : null}
          {permissions.canDelete ? <button className="button danger" data-testid={`btn-delete-${meta.test}`} onClick={() => actions.openDelete(object, id, title)}>{tCommon("delete")}</button> : null}
          {permissions.canWrite ? <button className="button" data-testid={`btn-clone-${meta.test}`} onClick={() => actions.openClone(object, id)}>{tCommon("clone")}</button> : null}
          {object === "lead" && permissions.canWrite && (record as Lead).status !== "Converted" ? (
            <button className="button primary" data-testid="btn-convert-lead" onClick={() => actions.openConvertLead(id)}>{tCrm("actions.convertLead")}</button>
          ) : null}
          {permissions.canWrite ? <button className="button primary" data-testid={`btn-new-task-${meta.test}`} onClick={() => actions.openActivity(object, id, "Task")}>{tCrm("actions.newTask")}</button> : null}
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label={`${meta.singular} tabs`}>
        {(["details", "activity", "related"] as const).map((name) => (
          <button
            key={name}
            className={tab === name ? "active" : ""}
            data-testid={`tab-${meta.test}-${name}`}
            role="tab"
            aria-selected={tab === name}
            onClick={() => setTab(name)}
          >
            {tCommon(name)}
          </button>
        ))}
      </div>

      <div className="tab-panel" data-testid={`panel-${meta.test}-${tab}`}>
        {tab === "details" ? <DetailsPanel object={object} record={record} data={data} locale={locale} /> : null}
        {tab === "activity" ? <ActivityTab object={object} id={id} activities={activities} actions={actions} permissions={permissions} data={data} /> : null}
        {tab === "related" ? <RelatedTab object={object} id={id} data={data} locale={locale} /> : null}
      </div>
    </section>
  );
}

function DetailsPanel({ object, record, data, locale }: { object: CrmObject; record: RecordItem; data: CrmData; locale: Locale }) {
  const groups = detailGroups(object, record, data, locale);
  return (
    <div className="detail-grid">
      {groups.map((group) => (
        <section className="detail-card" key={group.title}>
          <h2>{group.title}</h2>
          <dl>
            {group.fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function ActivityTab({ object, id, activities, actions, permissions, data }: { object: CrmObject; id: string; activities: Activity[]; actions: Actions; permissions: CrmPermissions; data: CrmData }) {
  const tCrm = useTranslations("crm");
  return (
    <div className="activity-layout">
      {permissions.canWrite ? (
        <div className="activity-composer" data-testid="activity-actions">
          <button className="button" data-testid="btn-log-call" onClick={() => actions.openActivity(object, id, "Call")}>{tCrm("actions.logCall")}</button>
          <button className="button primary" data-testid="btn-new-task" onClick={() => actions.openActivity(object, id, "Task")}>{tCrm("actions.newTask")}</button>
          <button className="button" data-testid="btn-add-note" onClick={() => actions.openActivity(object, id, "Note")}>{tCrm("actions.addNote")}</button>
        </div>
      ) : null}
      <ActivityPanel title={tCrm("tabs.upcoming")} activities={activities.filter((activity) => activity.status === "Open")} data={data} actions={permissions.canDelete ? actions : undefined} />
      <ActivityPanel title={tCrm("tabs.pastActivity")} activities={activities.filter((activity) => activity.status === "Completed")} data={data} actions={permissions.canDelete ? actions : undefined} />
    </div>
  );
}

function RelatedTab({ object, id, data, locale }: { object: CrmObject; id: string; data: CrmData; locale: Locale }) {
  const tCommon = useTranslations("common");
  const related = relatedSections(object, id, data, locale);
  return (
    <div className="related-grid" data-testid="related-lists">
      {related.map((section) => (
        <section className="related-card" key={section.title}>
          <div className="related-title">
            <h2>{section.title}</h2>
            <span>{section.items.length}</span>
          </div>
          {section.items.length ? section.items.map((item) => (
            <Link className="related-item" href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </Link>
          )) : <p className="muted">{tCommon("noRelatedRecords")}</p>}
        </section>
      ))}
    </div>
  );
}

function translateObject(object: CrmObject, plural: boolean, locale: Locale) {
  const key = `${object}${plural ? "Plural" : ""}`;
  return translateValue(key, locale) === key ? objectMeta[object][plural ? "plural" : "singular"] : translateValue(key, locale);
}
