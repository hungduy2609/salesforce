"use client";

import { RecordFormFields, type RecordFormFieldsProps } from "./RecordFormFields";

type Props = Omit<RecordFormFieldsProps, "object">;

export function LeadForm(props: Props) {
  return <RecordFormFields {...props} object="lead" />;
}
