"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { OwnerUser } from "@/lib/crm-data";
import type { CrmData, CrmObject } from "@/lib/types";
import { formFields, translateValue } from "../workspace/helpers";
import { objectMeta } from "../workspace/types";

export type RecordFormFieldsProps = {
  object: CrmObject;
  data: CrmData;
  values: Record<string, string>;
  errors: Record<string, string>;
  ownerUsers: OwnerUser[];
  canTransferOwner: boolean;
  onChange: (key: string, value: string) => void;
};

export function RecordFormFields({ object, data, values, errors, ownerUsers, canTransferOwner, onChange }: RecordFormFieldsProps) {
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");
  const meta = objectMeta[object];

  return (
    <div className="form-grid">
      {formFields(object, data, values, ownerUsers, canTransferOwner).map((field) => (
        <label key={field.name} className={field.full ? "full" : ""}>
          {translateValue(field.label, locale)}{field.required ? " *" : ""}
          {field.type === "select" ? (
            <select data-testid={`select-${meta.test}-${field.name}`} value={values[field.name] ?? ""} disabled={field.disabled} onChange={(event) => onChange(field.name, event.target.value)}>
              {field.options.map((option) => <option key={option.value} value={option.value}>{translateValue(option.label, locale)}</option>)}
            </select>
          ) : (
            <input data-testid={`input-${meta.test}-${field.name}`} type={field.type} value={values[field.name] ?? ""} disabled={field.disabled} onChange={(event) => onChange(field.name, event.target.value)} />
          )}
          {field.help ? <small className="field-help">{translateValue(field.help, locale)}</small> : null}
          {errors[field.name] ? <small className="field-error">{errors[field.name] === "Required" ? tCommon("required") : translateValue(errors[field.name], locale)}</small> : null}
        </label>
      ))}
    </div>
  );
}
