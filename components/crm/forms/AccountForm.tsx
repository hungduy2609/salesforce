"use client";

import { RecordFormFields, type RecordFormFieldsProps } from "./RecordFormFields";

type Props = Omit<RecordFormFieldsProps, "object">;

export function AccountForm(props: Props) {
  return <RecordFormFields {...props} object="account" />;
}
