"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  tableRow
} from "../workspace/helpers";
import type { Actions, CrmPermissions, RecordItem, SortState } from "../workspace/types";
import { objectMeta } from "../workspace/types";

export function ObjectRecordsView({ object, recordId, data, actions, permissions }: { object: CrmObject; recordId?: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  if (recordId) return <RecordDetail object={object} id={recordId} data={data} actions={actions} permissions={permissions} />;
  return <ObjectList object={object} data={data} actions={actions} permissions={permissions} />;
}

function ObjectList({ object, data, actions, permissions }: { object: CrmObject; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
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

  function toggleSort(key: string) {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  return (
    <section className="page-stack" data-testid={`page-${meta.test}s`}>
      <ObjectHeader title={meta.plural} subtitle={`${rows.length} records in All ${meta.plural}`}>
        {permissions.canWrite ? (
          <button className="button primary" data-testid={`btn-new-${meta.test}`} onClick={() => actions.openCreate(object)}>
            New {meta.singular}
          </button>
        ) : null}
      </ObjectHeader>

      <div className="list-card" data-testid={`list-${meta.test}s`}>
        <div className="list-toolbar" data-testid={`toolbar-${meta.test}s`}>
          <label>
            List View
            <select data-testid={`select-${meta.test}-list-view`} defaultValue="all">
              <option value="all">All {meta.plural}</option>
              <option value="mine">My {meta.plural}</option>
              <option value="recent">Recently Viewed</option>
            </select>
          </label>
          <label className="toolbar-search">
            Search this list
            <input
              data-testid={`input-${meta.test}-search`}
              value={search}
              placeholder={`Search ${meta.plural.toLowerCase()}...`}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Filter
            <select
              data-testid={`select-${meta.test}-status`}
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <button className="button ghost" data-testid={`btn-refresh-${meta.test}`} onClick={() => setPage(1)}>Refresh</button>
        </div>

        <div className="table-wrap">
          <table data-testid={`table-${meta.test}s`}>
            <thead>{tableHead(object, sort, toggleSort)}</thead>
            <tbody>
              {visible.length ? visible.map((record) => tableRow(object, record, data, actions, permissions)) : (
                <tr>
                  <td colSpan={8}>
                    <EmptyState object={meta.singular} onCreate={permissions.canWrite ? () => actions.openCreate(object) : undefined} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" data-testid={`pagination-${meta.test}s`}>
          <span>Page {page} of {pageCount}</span>
          <button className="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button className="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
        </div>
      </div>
    </section>
  );
}

function RecordDetail({ object, id, data, actions, permissions }: { object: CrmObject; id: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  const [tab, setTab] = useState<"details" | "activity" | "related">("details");
  const record = findById(recordsForObject(data, object), id);
  const meta = objectMeta[object];

  if (!record) {
    return (
      <section className="page-stack" data-testid="record-not-found">
        <ObjectHeader title={`${meta.singular} not found`} subtitle="The requested seeded record does not exist.">
          <Link className="button" href={meta.listPath}>Back to {meta.plural}</Link>
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
          <p className="breadcrumb"><Link href={meta.listPath}>{meta.plural}</Link> / {title}</p>
          <p className="eyebrow">{meta.singular}</p>
          <h1>{title}</h1>
          <div className="key-fields">{keyFields(object, record, data).map((field) => <span key={field}>{field}</span>)}</div>
        </div>
        <div className="record-actions">
          {permissions.canWrite ? <button className="button" data-testid={`btn-edit-${meta.test}`} onClick={() => actions.openEdit(object, id)}>Edit</button> : null}
          {permissions.canDelete ? <button className="button danger" data-testid={`btn-delete-${meta.test}`} onClick={() => actions.openDelete(object, id, title)}>Delete</button> : null}
          {permissions.canWrite ? <button className="button" data-testid={`btn-clone-${meta.test}`} onClick={() => actions.openClone(object, id)}>Clone</button> : null}
          {object === "lead" && permissions.canWrite && (record as Lead).status !== "Converted" ? (
            <button className="button primary" data-testid="btn-convert-lead" onClick={() => actions.openConvertLead(id)}>Convert Lead</button>
          ) : null}
          {permissions.canWrite ? <button className="button primary" data-testid={`btn-new-task-${meta.test}`} onClick={() => actions.openActivity(object, id, "Task")}>New Task</button> : null}
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
            {name.charAt(0).toUpperCase()}{name.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-panel" data-testid={`panel-${meta.test}-${tab}`}>
        {tab === "details" ? <DetailsPanel object={object} record={record} data={data} /> : null}
        {tab === "activity" ? <ActivityTab object={object} id={id} activities={activities} actions={actions} permissions={permissions} data={data} /> : null}
        {tab === "related" ? <RelatedTab object={object} id={id} data={data} /> : null}
      </div>
    </section>
  );
}

function DetailsPanel({ object, record, data }: { object: CrmObject; record: RecordItem; data: CrmData }) {
  const groups = detailGroups(object, record, data);
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
  return (
    <div className="activity-layout">
      {permissions.canWrite ? (
        <div className="activity-composer" data-testid="activity-actions">
          <button className="button" data-testid="btn-log-call" onClick={() => actions.openActivity(object, id, "Call")}>Log a Call</button>
          <button className="button primary" data-testid="btn-new-task" onClick={() => actions.openActivity(object, id, "Task")}>New Task</button>
          <button className="button" data-testid="btn-add-note" onClick={() => actions.openActivity(object, id, "Note")}>Add Note</button>
        </div>
      ) : null}
      <ActivityPanel title="Upcoming" activities={activities.filter((activity) => activity.status === "Open")} data={data} actions={permissions.canDelete ? actions : undefined} />
      <ActivityPanel title="Past Activity" activities={activities.filter((activity) => activity.status === "Completed")} data={data} actions={permissions.canDelete ? actions : undefined} />
    </div>
  );
}

function RelatedTab({ object, id, data }: { object: CrmObject; id: string; data: CrmData }) {
  const related = relatedSections(object, id, data);
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
          )) : <p className="muted">No related records found.</p>}
        </section>
      ))}
    </div>
  );
}
