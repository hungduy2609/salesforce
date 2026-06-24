"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import type { Locale } from "@/i18n/routing";
import type { CrmData } from "@/lib/types";
import { findById, fullName, today, translateValue } from "../workspace/helpers";
import type { ConvertLeadValues } from "../workspace/types";

export function ConvertLeadModal({ data, leadId, isConverting, onClose, onConvert }: { data: CrmData; leadId: string; isConverting: boolean; onClose: () => void; onConvert: (values: ConvertLeadValues) => void }) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");
  const tCrm = useTranslations("crm");
  const tModal = useTranslations("modals");
  const lead = findById(data.leads, leadId);
  const [values, setValues] = useState<ConvertLeadValues>(() => ({
    leadId,
    accountMode: "new",
    accountId: data.accounts[0]?.id ?? "",
    accountName: lead?.company ?? "",
    createOpportunity: true,
    opportunityName: lead ? `${lead.company} Opportunity` : "New Opportunity",
    amount: "0",
    closeDate: today()
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!lead) return null;

  function change(key: keyof ConvertLeadValues, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (values.accountMode === "new" && !values.accountName.trim()) nextErrors.accountName = tCommon("required");
    if (values.accountMode === "existing" && !values.accountId) nextErrors.accountId = tCommon("required");
    if (values.createOpportunity && !values.opportunityName.trim()) nextErrors.opportunityName = tCommon("required");
    if (values.createOpportunity && Number.isNaN(Number(values.amount))) nextErrors.amount = tCommon("validAmount");
    if (values.createOpportunity && !values.closeDate) nextErrors.closeDate = tCommon("required");

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onConvert(values);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" data-testid="modal-convert-lead" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{tCrm("actions.convertLead")}</p>
            <h2>{fullName(lead)}</h2>
          </div>
          <button type="button" className="icon-button" aria-label={tCommon("closeModal")} onClick={onClose} disabled={isConverting}>×</button>
        </div>

        <div className="form-grid">
          <label>
            {tCrm("objects.account")}
            <select data-testid="select-convert-account-mode" value={values.accountMode} onChange={(event) => change("accountMode", event.target.value as ConvertLeadValues["accountMode"])}>
              <option value="new">{tModal("createNewAccount")}</option>
              <option value="existing">{tModal("useExistingAccount")}</option>
            </select>
          </label>
          {values.accountMode === "new" ? (
            <label>
              {tCrm("objects.account")} *
              <input data-testid="input-convert-account-name" value={values.accountName} onChange={(event) => change("accountName", event.target.value)} />
              {errors.accountName ? <small className="field-error">{errors.accountName}</small> : null}
            </label>
          ) : (
            <label>
              {tModal("existingAccount")} *
              <select data-testid="select-convert-account-id" value={values.accountId} onChange={(event) => change("accountId", event.target.value)}>
                {data.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
              {errors.accountId ? <small className="field-error">{errors.accountId}</small> : null}
            </label>
          )}
          <label className="full checkbox-field">
            <input type="checkbox" data-testid="checkbox-convert-opportunity" checked={values.createOpportunity} onChange={(event) => change("createOpportunity", event.target.checked)} />
            {tModal("createOpportunity")}
          </label>
          {values.createOpportunity ? (
            <>
              <label className="full">
                {tCrm("objects.opportunity")} *
                <input data-testid="input-convert-opportunity-name" value={values.opportunityName} onChange={(event) => change("opportunityName", event.target.value)} />
                {errors.opportunityName ? <small className="field-error">{errors.opportunityName}</small> : null}
              </label>
              <label>
                {translateValue("Amount", locale)}
                <input data-testid="input-convert-amount" type="number" value={values.amount} onChange={(event) => change("amount", event.target.value)} />
                {errors.amount ? <small className="field-error">{errors.amount}</small> : null}
              </label>
              <label>
                {translateValue("Close Date", locale)} *
                <input data-testid="input-convert-close-date" type="date" value={values.closeDate} onChange={(event) => change("closeDate", event.target.value)} />
                {errors.closeDate ? <small className="field-error">{errors.closeDate}</small> : null}
              </label>
            </>
          ) : null}
        </div>

        <p className="muted">{tModal("conversionBody")}</p>
        <div className="modal-footer">
          <button type="button" className="button" onClick={onClose} disabled={isConverting}>{tCommon("cancel")}</button>
          <button className="button primary" data-testid="btn-confirm-convert-lead" type="submit" disabled={isConverting}>
            {isConverting ? <LoadingIndicator label={tCommon("converting")} size="sm" /> : tCrm("actions.convertLead")}
          </button>
        </div>
      </form>
    </div>
  );
}
