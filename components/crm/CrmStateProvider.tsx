"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { CrmData } from "@/lib/types";
import type { CrmPermissions, CurrentUser } from "./workspace/types";
import type { OwnerUser } from "@/lib/crm-data";

type CrmStateContextValue = {
  data: CrmData;
  setData: Dispatch<SetStateAction<CrmData>>;
  databaseEnabled: boolean;
  permissions: CrmPermissions;
  currentUser: CurrentUser;
  ownerUsers: OwnerUser[];
};

const CrmStateContext = createContext<CrmStateContextValue | null>(null);

export function CrmStateProvider({
  children,
  initialData,
  databaseEnabled,
  permissions,
  currentUser,
  ownerUsers
}: {
  children: ReactNode;
  initialData: CrmData;
  databaseEnabled: boolean;
  permissions: CrmPermissions;
  currentUser: CurrentUser;
  ownerUsers: OwnerUser[];
}) {
  const [data, setData] = useState<CrmData>(() => structuredClone(initialData));

  useEffect(() => {
    setData(structuredClone(initialData));
  }, [initialData]);

  return (
    <CrmStateContext.Provider value={{ data, setData, databaseEnabled, permissions, currentUser, ownerUsers }}>
      {children}
    </CrmStateContext.Provider>
  );
}

export function useCrmState() {
  return useContext(CrmStateContext);
}
