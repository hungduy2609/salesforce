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
          data={controller.data}
          modal={controller.modal}
          currentUser={controller.currentUser}
          ownerUsers={controller.ownerUsers}
          canTransferOwner={controller.permissions.canTransferOwner}
          onClose={controller.closeRecordModal}
          onSave={controller.saveRecord}
        />
      ) : null}
      {controller.activityModal ? (
        <ActivityFormModal
          data={controller.data}
          modal={controller.activityModal}
          currentUser={controller.currentUser}
          ownerUsers={controller.ownerUsers}
          canTransferOwner={controller.permissions.canTransferOwner}
          onClose={controller.closeActivityModal}
          onSave={controller.saveActivity}
        />
      ) : null}
      {controller.convertModal ? (
        <ConvertLeadModal
          data={controller.data}
          leadId={controller.convertModal.leadId}
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
