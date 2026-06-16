"use client";

import { useState, type FormEvent } from "react";
import type { OwnerUser } from "@/lib/crm-data";
import type { CrmData, CrmObject } from "@/lib/types";
import { AccountForm } from "../forms/AccountForm";
import { ContactForm } from "../forms/ContactForm";
import { LeadForm } from "../forms/LeadForm";
import { OpportunityForm } from "../forms/OpportunityForm";
import {
  capitalize,
  defaultActivitySubject,
  displayName,
  findById,
  firstRelatedId,
  formDefaults,
  normalizeCrmObject,
  ownerOptions,
  recordsForObject,
  today,
  validateForm
} from "../workspace/helpers";
import type { ActivityModalState, CurrentUser, ModalState, RecordMode } from "../workspace/types";
import { objectMeta } from "../workspace/types";

export function RecordModal({ data, modal, currentUser, ownerUsers, canTransferOwner, onClose, onSave }: { data: CrmData; modal: NonNullable<ModalState>; currentUser: CurrentUser; ownerUsers: OwnerUser[]; canTransferOwner: boolean; onClose: () => void; onSave: (object: CrmObject, mode: RecordMode, values: Record<string, string>, id?: string) => void }) {
  const source = modal.id ? findById(recordsForObject(data, modal.object), modal.id) : undefined;
  const [values, setValues] = useState<Record<string, string>>(() => formDefaults(modal.object, source, data, modal.mode, currentUser));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const meta = objectMeta[modal.object];

  function change(key: string, value: string) {
    setValues((current) => {
      if (modal.object === "opportunity" && key === "accountId") {
        const contactBelongsToAccount = data.contacts.some((contact) => contact.id === current.contactId && contact.accountId === value);
        return { ...current, accountId: value, contactId: contactBelongsToAccount ? current.contactId : "" };
      }

      return { ...current, [key]: value };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(modal.object, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSave(modal.object, modal.mode, values, modal.id);
  }

  const formProps = { data, values, errors, ownerUsers, canTransferOwner, onChange: change };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" data-testid={`modal-${meta.test}-form`} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{capitalize(modal.mode)}</p>
            <h2>{modal.mode === "edit" ? "Edit" : "New"} {meta.singular}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close modal" onClick={onClose}>×</button>
        </div>
        {modal.object === "lead" ? <LeadForm {...formProps} /> : null}
        {modal.object === "account" ? <AccountForm {...formProps} /> : null}
        {modal.object === "contact" ? <ContactForm {...formProps} /> : null}
        {modal.object === "opportunity" ? <OpportunityForm {...formProps} /> : null}
        <div className="modal-footer">
          <button type="button" className="button" data-testid={`btn-cancel-${meta.test}`} onClick={onClose}>Cancel</button>
          <button type="submit" className="button primary" data-testid={`btn-save-${meta.test}`}>Save</button>
        </div>
      </form>
    </div>
  );
}

export function ActivityFormModal({ data, modal, currentUser, ownerUsers, canTransferOwner, onClose, onSave }: { data: CrmData; modal: ActivityModalState; currentUser: CurrentUser; ownerUsers: OwnerUser[]; canTransferOwner: boolean; onClose: () => void; onSave: (values: Record<string, string>) => void }) {
  const safeModal = modal as NonNullable<ActivityModalState>;
  const existing = safeModal.id ? findById(data.activities, safeModal.id) : undefined;
  const initialRelatedType = safeModal.relatedType ?? existing?.relatedType ?? "lead";
  const [values, setValues] = useState<Record<string, string>>(() => ({
    relatedType: initialRelatedType,
    relatedId: safeModal.relatedId ?? existing?.relatedId ?? firstRelatedId(data, initialRelatedType),
    type: safeModal.type ?? existing?.type ?? "Task",
    subject: existing?.subject ?? defaultActivitySubject(safeModal.type ?? "Task"),
    description: existing?.description ?? "",
    dueDate: existing?.dueDate ?? today(),
    status: existing?.status ?? (safeModal.type === "Call" ? "Completed" : "Open"),
    createdBy: existing?.createdBy ?? currentUser.name
  }));
  const relatedType = normalizeCrmObject(values.relatedType);
  const relatedOptions = recordsForObject(data, relatedType).map((record) => ({ value: record.id, label: displayName(relatedType, record, data) }));

  function change(key: string, value: string) {
    setValues((current) => {
      if (key === "relatedType") {
        const nextType = normalizeCrmObject(value);
        return { ...current, relatedType: nextType, relatedId: firstRelatedId(data, nextType) };
      }
      if (key === "type") {
        return { ...current, type: value, status: value === "Call" ? "Completed" : current.status };
      }
      return { ...current, [key]: value };
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal compact" data-testid="modal-activity-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}>
        <div className="modal-header">
          <div><p className="eyebrow">Activity</p><h2>{safeModal.mode === "edit" ? "Edit Activity" : "New Activity"}</h2></div>
          <button type="button" className="icon-button" aria-label="Close modal" onClick={onClose}>×</button>
        </div>
        <label>Type<select data-testid="select-activity-type" value={values.type} onChange={(event) => change("type", event.target.value)}>{["Call", "Task", "Note", "Email"].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label>Related Object<select data-testid="select-activity-related-type" value={values.relatedType} onChange={(event) => change("relatedType", event.target.value)}>{(["lead", "account", "contact", "opportunity"] as CrmObject[]).map((type) => <option key={type} value={type}>{capitalize(type)}</option>)}</select></label>
        <label>Related Record<select data-testid="select-activity-related-id" value={values.relatedId} onChange={(event) => change("relatedId", event.target.value)}>{relatedOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label>Subject *<input data-testid="input-activity-subject" value={values.subject} onChange={(event) => change("subject", event.target.value)} required /></label>
        <label>Description<textarea data-testid="input-activity-description" value={values.description} onChange={(event) => change("description", event.target.value)} /></label>
        <label>Due Date<input data-testid="input-activity-due-date" type="date" value={values.dueDate} onChange={(event) => change("dueDate", event.target.value)} /></label>
        <label>Status<select data-testid="select-activity-status-modal" value={values.status} onChange={(event) => change("status", event.target.value)}><option value="Open">Open</option><option value="Completed">Completed</option></select></label>
        <label>Assigned To<select data-testid="select-activity-created-by" value={values.createdBy} disabled={!canTransferOwner} onChange={(event) => change("createdBy", event.target.value)}>{ownerOptions(ownerUsers, values.createdBy).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{!canTransferOwner ? <small className="field-help">Only managers and admins can reassign activities.</small> : null}</label>
        <div className="modal-footer"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Save Activity</button></div>
      </form>
    </div>
  );
}
