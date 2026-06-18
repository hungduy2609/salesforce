"use client";

import { useTranslations } from "next-intl";
import type { DeleteState } from "../workspace/types";

export function ConfirmDeleteModal({ target, onCancel, onConfirm }: { target: NonNullable<DeleteState>; onCancel: () => void; onConfirm: () => void }) {
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modals");

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal compact" data-testid="modal-confirm-delete" role="dialog" aria-modal="true">
        <div className="modal-header"><div><p className="eyebrow">{tModal("confirmDelete")}</p><h2>{tModal("deleteTitle", { label: target.label })}</h2></div></div>
        <p className="muted">{tModal("deleteBody")}</p>
        <div className="modal-footer"><button className="button" data-testid="btn-cancel-delete" onClick={onCancel}>{tCommon("cancel")}</button><button className="button danger" data-testid="btn-confirm-delete" onClick={onConfirm}>{tCommon("delete")}</button></div>
      </section>
    </div>
  );
}
