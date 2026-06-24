"use client";

import { ShadowBoundary } from "@/components/shadow/ShadowBoundary";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { CrmWorkspaceModals } from "./workspace/CrmWorkspaceModals";
import { CrmWorkspaceView } from "./workspace/CrmWorkspaceView";
import type { CrmWorkspaceProps } from "./workspace/types";
import { useCrmWorkspaceController } from "./workspace/useCrmWorkspaceController";

export function CrmWorkspace(props: CrmWorkspaceProps) {
  const controller = useCrmWorkspaceController(props);

  return (
    <>
      <ShadowBoundary name="crm-view-surface" level={3} dataTestId="shadow-crm-view-surface">
        <div className="workspace-surface" aria-busy={controller.isBusy}>
          <CrmWorkspaceView
            view={controller.view}
            recordId={controller.recordId}
            data={controller.data}
            actions={controller.actions}
            permissions={controller.permissions}
          />
          {controller.isBusy ? (
            <div className="workspace-loading-overlay" data-testid="workspace-loading">
              <LoadingIndicator label={controller.busyMessage} />
            </div>
          ) : null}
        </div>
      </ShadowBoundary>
      <CrmWorkspaceModals controller={controller} />
      {controller.toast ? (
        <div className="toast" data-testid="toast-message" role="status">
          {controller.toast}
        </div>
      ) : null}
    </>
  );
}
