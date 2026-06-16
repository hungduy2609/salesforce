import type { DeleteState } from "../workspace/types";

export function ConfirmDeleteModal({ target, onCancel, onConfirm }: { target: NonNullable<DeleteState>; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal compact" data-testid="modal-confirm-delete" role="dialog" aria-modal="true">
        <div className="modal-header"><div><p className="eyebrow">Confirm delete</p><h2>Delete {target.label}?</h2></div></div>
        <p className="muted">This removes the selected record from the local seeded workspace.</p>
        <div className="modal-footer"><button className="button" data-testid="btn-cancel-delete" onClick={onCancel}>Cancel</button><button className="button danger" data-testid="btn-confirm-delete" onClick={onConfirm}>Delete</button></div>
      </section>
    </div>
  );
}
