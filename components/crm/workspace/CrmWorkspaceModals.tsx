"use client";

import { ConfirmDeleteModal } from "../modals/ConfirmDeleteModal";
import { ConvertLeadModal } from "../modals/ConvertLeadModal";
import { ActivityFormModal, RecordModal } from "../modals/RecordModal";
import type { CrmWorkspaceController } from "./useCrmWorkspaceController";

export function CrmWorkspaceModals({ controller }: { controller: CrmWorkspaceController }) {
  return (
    <>
      {controller.modal ? (
        <RecordModal
          key={`${controller.modal.object}-${controller.modal.mode}-${controller.modal.id ?? "new"}`}
          data={controller.data}
          modal={controller.modal}
          currentUser={controller.currentUser}
          ownerUsers={controller.ownerUsers}
          canTransferOwner={controller.permissions.canTransferOwner}
          isSaving={controller.isBusy}
          onClose={controller.closeRecordModal}
          onSave={controller.saveRecord}
        />
      ) : null}
      {controller.activityModal ? (
        <ActivityFormModal
          key={`${controller.activityModal.mode}-${controller.activityModal.id ?? controller.activityModal.relatedType ?? "activity"}-${controller.activityModal.relatedId ?? controller.activityModal.type ?? "new"}`}
          data={controller.data}
          modal={controller.activityModal}
          currentUser={controller.currentUser}
          ownerUsers={controller.ownerUsers}
          canTransferOwner={controller.permissions.canTransferOwner}
          isSaving={controller.isBusy}
          onClose={controller.closeActivityModal}
          onSave={controller.saveActivity}
        />
      ) : null}
      {controller.convertModal ? (
        <ConvertLeadModal
          key={controller.convertModal.leadId}
          data={controller.data}
          leadId={controller.convertModal.leadId}
          isConverting={controller.isBusy}
          onClose={controller.closeConvertModal}
          onConvert={controller.convertLead}
        />
      ) : null}
      {controller.deleteTarget ? (
        <ConfirmDeleteModal target={controller.deleteTarget} onCancel={controller.closeDeleteDialog} onConfirm={controller.confirmDelete} />
      ) : null}
    </>
  );
}
