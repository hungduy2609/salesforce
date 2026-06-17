"use client";

import { seedData } from "@/lib/seed";
import type { Activity, ActivityType, CrmData, CrmObject, Lead } from "@/lib/types";
import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    applyLeadConversion,
    buildLocalLeadConversion,
    buildRecordChange,
    collectionKey,
    convertLeadInDatabase,
    deleteFromDatabase,
    findById,
    firstRelatedId,
    fullName,
    nextId,
    normalizeActivityType,
    normalizeCrmObject,
    saveActivityToDatabase,
    saveRecordToDatabase,
    today,
    upsert
} from "./helpers";
import type {
    ActivityModalState,
    ConvertLeadValues,
    ConvertModalState,
    CrmWorkspaceProps,
    DeleteState,
    ModalState,
    RecordMode
} from "./types";
import { objectMeta } from "./types";

export function useCrmWorkspaceController({
  view,
  recordId,
  initialData = seedData,
  databaseEnabled = false,
  permissions = { canWrite: true, canDelete: true, canTransferOwner: true },
  currentUser = { id: "Duy", name: "Duy", role: "SYSTEM_ADMINISTRATOR" as UserRole, roleLabel: "System Administrator" },
  ownerUsers = [{ id: "Duy", name: "Duy", roleLabel: "Demo User" }]
}: CrmWorkspaceProps) {
  const router = useRouter();
  const [data, setData] = useState<CrmData>(() => structuredClone(initialData));
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);
  const [activityModal, setActivityModal] = useState<ActivityModalState>(null);
  const [convertModal, setConvertModal] = useState<ConvertModalState>(null);
  const [toast, setToast] = useState<string>("");

  const actions = {
    openCreate: (object: CrmObject) => {
      if (!permissions.canWrite) return setToast("Your role does not allow creating CRM records");
      setModal({ object, mode: "create" });
    },
    openEdit: (object: CrmObject, id: string) => {
      if (!permissions.canWrite) return setToast("Your role does not allow editing CRM records");
      setModal({ object, mode: "edit", id });
    },
    openClone: (object: CrmObject, id: string) => {
      if (!permissions.canWrite) return setToast("Your role does not allow cloning CRM records");
      setModal({ object, mode: "clone", id });
    },
    openDelete: (object: CrmObject | "activity", id: string, label: string) => {
      if (!permissions.canDelete) return setToast("Your role does not allow deleting CRM data");
      setDeleteTarget({ object, id, label });
    },
    openActivity: (relatedType: CrmObject, relatedId: string, type: ActivityType) => {
      if (!permissions.canWrite) return setToast("Your role does not allow creating activities");
      setActivityModal({ mode: "create", relatedType, relatedId, type });
    },
    openCreateActivity: () => {
      if (!permissions.canWrite) return setToast("Your role does not allow creating activities");
      setActivityModal({ mode: "create" });
    },
    openEditActivity: (id: string) => {
      if (!permissions.canWrite) return setToast("Your role does not allow editing activities");
      setActivityModal({ mode: "edit", id });
    },
    openConvertLead: (leadId: string) => {
      if (!permissions.canWrite) return setToast("Your role does not allow converting leads");
      setConvertModal({ leadId });
    }
  };

  function saveRecord(object: CrmObject, mode: RecordMode, values: Record<string, string>, id?: string) {
    const now = today();
    const { nextData, record } = buildRecordChange(data, object, mode, values, now, id, currentUser);

    setData(nextData);
    setToast(`${objectMeta[object].singular} ${mode === "edit" ? "updated" : "created"}`);
    setModal(null);

    if (databaseEnabled) {
      void saveRecordToDatabase(object, record, setToast, () => router.refresh());
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;

    setData((current) => {
      if (target.object === "activity") {
        return { ...current, activities: current.activities.filter((activity) => activity.id !== target.id) };
      }
      if (target.object === "account") {
        const contacts = current.contacts.filter((contact) => contact.accountId !== target.id);
        const opportunities = current.opportunities.filter((opportunity) => opportunity.accountId !== target.id);
        return {
          ...current,
          accounts: current.accounts.filter((account) => account.id !== target.id),
          contacts,
          opportunities,
          activities: current.activities.filter(
            (activity) => !(activity.relatedType === "account" && activity.relatedId === target.id)
          )
        };
      }
      const key = collectionKey(target.object);
      return {
        ...current,
        [key]: current[key].filter((record) => record.id !== target.id),
        activities: current.activities.filter(
          (activity) => !(activity.relatedType === target.object && activity.relatedId === target.id)
        )
      } as CrmData;
    });
    setToast(`${target.label} deleted`);
    setDeleteTarget(null);

    if (databaseEnabled) {
      void deleteFromDatabase(target.object, target.id, setToast, () => router.refresh());
    }
  }

  function saveActivity(values: Record<string, string>) {
    if (!activityModal) return;
    const existing = activityModal.id ? findById(data.activities, activityModal.id) : undefined;
    const relatedType = normalizeCrmObject(values.relatedType || activityModal.relatedType || "lead");
    const activity: Activity = {
      id: activityModal.mode === "edit" && activityModal.id ? activityModal.id : nextId("act", data.activities),
      relatedType,
      relatedId: values.relatedId || activityModal.relatedId || firstRelatedId(data, relatedType),
      type: normalizeActivityType(values.type || activityModal.type || "Task"),
      subject: values.subject.trim(),
      description: values.description.trim(),
      dueDate: values.dueDate || today(),
      status: values.status === "Completed" ? "Completed" : "Open",
      createdBy: values.createdBy.trim() || "Duy",
      createdAt: existing?.createdAt ?? today()
    };
    setData((current) => ({ ...current, activities: upsert(current.activities, activity, activityModal.mode === "edit") }));
    setToast(`Activity ${activityModal.mode === "edit" ? "updated" : "added"}`);
    setActivityModal(null);

    if (databaseEnabled) {
      void saveActivityToDatabase(activity, setToast, () => router.refresh());
    }
  }

  async function convertLead(values: ConvertLeadValues) {
    const lead = findById(data.leads, values.leadId) as Lead | undefined;
    if (!lead) return;

    setConvertModal(null);

    if (databaseEnabled) {
      const result = await convertLeadInDatabase(values, setToast);
      if (!result) return;

      setData((current) => applyLeadConversion(current, result));
      setToast(`${fullName(result.contact)} converted from lead`);
      router.refresh();
      return;
    }

    const result = buildLocalLeadConversion(data, lead, values);
    setData((current) => applyLeadConversion(current, result));
    setToast(`${fullName(result.contact)} converted from lead`);
  }

  return {
    view,
    recordId,
    data,
    modal,
    deleteTarget,
    activityModal,
    convertModal,
    toast,
    permissions,
    currentUser,
    ownerUsers,
    actions,
    saveRecord,
    confirmDelete,
    saveActivity,
    convertLead,
    closeRecordModal: () => setModal(null),
    closeActivityModal: () => setActivityModal(null),
    closeConvertModal: () => setConvertModal(null),
    closeDeleteDialog: () => setDeleteTarget(null)
  };
}

export type CrmWorkspaceController = ReturnType<typeof useCrmWorkspaceController>;
