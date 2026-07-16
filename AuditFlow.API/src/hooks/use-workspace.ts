'use client';

import * as React from 'react';

import {
  createDefaultWorkspaceState,
  loadWorkspaceState,
  type WorkspaceState,
  WORKSPACE_UPDATED_EVENT,
} from '@/lib/workspace-storage';

export function useWorkspace(): { isReady: boolean; workspace: WorkspaceState } {
  const [workspace, setWorkspace] = React.useState<WorkspaceState>(createDefaultWorkspaceState);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const syncWorkspace = (): void => {
      setWorkspace(loadWorkspaceState());
      setIsReady(true);
    };

    syncWorkspace();
    globalThis.addEventListener(WORKSPACE_UPDATED_EVENT, syncWorkspace);

    return () => {
      globalThis.removeEventListener(WORKSPACE_UPDATED_EVENT, syncWorkspace);
    };
  }, []);

  return { isReady, workspace };
}
