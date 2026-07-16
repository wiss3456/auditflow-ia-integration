import type { User } from '@/types/user';
import type { AuditMission } from '@/lib/missions/mock-data';
import type { WorkspaceState } from '@/lib/workspace-storage';

import { filterMissionsForUser } from './access';

export function getSelectedMissionIdForUser(workspace: WorkspaceState, userId: string | null | undefined): string | null {
  if (!userId) {
    return null;
  }

  return workspace.selectedMissionByUserId[userId] ?? null;
}

export function getSelectedMissionForUser(workspace: WorkspaceState, user: User | null): AuditMission | null {
  const selectedMissionId = getSelectedMissionIdForUser(workspace, user?.id);

  if (!selectedMissionId) {
    return null;
  }

  return filterMissionsForUser(workspace.missions, user).find((mission) => mission.id === selectedMissionId) ?? null;
}
