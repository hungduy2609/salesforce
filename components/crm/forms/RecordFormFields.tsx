"use client";

import type { OwnerUser } from "@/lib/crm-data";
import type { CrmData, CrmObject } from "@/lib/types";
import { formFields } from "../workspace/helpers";
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
  const meta = objectMeta[object];

  return (
    <div className="form-grid">
      {formFields(object, data, values, ownerUsers, canTransferOwner).map((field) => (
        <label key={field.name} className={field.full ? "full" : ""}>
          {field.label}{field.required ? " *" : ""}
          {field.type === "select" ? (
            <select data-testid={`select-${meta.test}-${field.name}`} value={values[field.name] ?? ""} disabled={field.disabled} onChange={(event) => onChange(field.name, event.target.value)}>
              {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <input data-testid={`input-${meta.test}-${field.name}`} type={field.type} value={values[field.name] ?? ""} disabled={field.disabled} onChange={(event) => onChange(field.name, event.target.value)} />
          )}
          {field.help ? <small className="field-help">{field.help}</small> : null}
          {errors[field.name] ? <small className="field-error">{errors[field.name]}</small> : null}
        </label>
      ))}
    </div>
  );
}
