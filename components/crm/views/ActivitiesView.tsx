"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { CrmData } from "@/lib/types";
import {
  Badge,
  EmptyState,
  ObjectHeader,
  activityRelatedHref,
  activitySearchText,
  capitalize,
  relatedLabel,
  sortActivities,
  translateValue
} from "../workspace/helpers";
import type { Actions, CrmPermissions, SortState } from "../workspace/types";

export function ActivitiesView({ data, actions, permissions }: { data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");
  const tActivities = useTranslations("activities");
  const tCrm = useTranslations("crm");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<SortState>({ key: "dueDate", direction: "desc" });
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const rows = useMemo(() => {
    const searched = data.activities.filter((activity) => activitySearchText(activity, data).includes(search.toLowerCase()));
    const filtered = filter === "all" ? searched : searched.filter((activity) => activity.status === filter || activity.type === filter || activity.relatedType === filter);
    return [...filtered].sort((a, b) => sortActivities(a, b, sort, data));
  }, [data, filter, search, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const filterOptions = ["Open", "Completed", "Call", "Task", "Note", "Email", "lead", "account", "contact", "opportunity"];

  function toggleSort(key: string) {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  return (
    <section className="page-stack" data-testid="page-activities">
      <ObjectHeader title={tActivities("title")} subtitle={tActivities("subtitle", { count: rows.length })}>
        {permissions.canWrite ? (
          <button className="button primary" data-testid="btn-new-activity" onClick={actions.openCreateActivity}>{tActivities("newActivity")}</button>
        ) : null}
      </ObjectHeader>

      <div className="list-card" data-testid="list-activities">
        <div className="list-toolbar" data-testid="toolbar-activities">
          <label>
            {tCommon("listView")}
            <select data-testid="select-activity-list-view" defaultValue="all">
              <option value="all">{tActivities("allActivities")}</option>
              <option value="mine">{tActivities("myActivities")}</option>
              <option value="open">{tActivities("openActivities")}</option>
            </select>
          </label>
          <label className="toolbar-search">
            {tCommon("searchThisList")}
            <input
              data-testid="input-activity-search"
              value={search}
              placeholder={tActivities("searchPlaceholder")}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            {tCommon("filter")}
            <select
              data-testid="select-activity-status"
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">{tCommon("all")}</option>
              {filterOptions.map((option) => <option key={option} value={option}>{translateValue(capitalize(option), locale)}</option>)}
            </select>
          </label>
          <button className="button ghost" data-testid="btn-refresh-activity" onClick={() => setPage(1)}>{tCommon("refresh")}</button>
        </div>

        <div className="table-wrap">
          <table data-testid="table-activities">
            <thead>
              <tr>
                <th><input aria-label={tCommon("selectAllActivities")} type="checkbox" /></th>
                {[ ["subject", "Subject"], ["type", "Type"], ["related", "Related To"], ["dueDate", "Due Date"], ["status", "Status"], ["createdBy", "Assigned To"] ].map(([key, label]) => (
                  <th key={key}><button onClick={() => toggleSort(key)}>{translateValue(label, locale)}{sort.key === key ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}</button></th>
                ))}
                <th>{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.length ? visible.map((activity) => (
                <tr key={activity.id} data-testid="row-activity">
                  <td><input aria-label={tCommon("selectRecord", { record: activity.subject })} type="checkbox" /></td>
                  <td data-testid="cell-activity-name"><strong>{activity.subject}</strong><small className="cell-note">{activity.description || tCommon("noDescription")}</small></td>
                  <td><Badge value={activity.type} /></td>
                  <td><Link href={activityRelatedHref(activity)}>{relatedLabel(activity, data)}</Link><small className="cell-note">{translateValue(activity.relatedType, locale)}</small></td>
                  <td>{activity.dueDate}</td>
                  <td><Badge value={activity.status} /></td>
                  <td>{activity.createdBy}</td>
                  <td>
                    <div className="row-actions" data-testid="row-actions-activity">
                      <Link className="mini-link" href={activityRelatedHref(activity)}>{tCrm("actions.viewRelated")}</Link>
                      {permissions.canWrite ? <button onClick={() => actions.openEditActivity(activity.id)}>{tCommon("edit")}</button> : null}
                      {permissions.canDelete ? <button onClick={() => actions.openDelete("activity", activity.id, activity.subject)}>{tCommon("delete")}</button> : null}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8}><EmptyState object={tCrm("objects.activity")} onCreate={permissions.canWrite ? actions.openCreateActivity : undefined} /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" data-testid="pagination-activities">
          <span>{tCommon("pageOf", { page, pageCount })}</span>
          <button className="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{tCommon("previous")}</button>
          <button className="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>{tCommon("next")}</button>
        </div>
      </div>
    </section>
  );
}
