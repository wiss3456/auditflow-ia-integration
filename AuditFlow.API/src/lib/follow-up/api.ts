'use client';

import { apiRequest } from '@/lib/api/http';
import { authClient } from '@/lib/auth/client';
import type {
  WorkspaceFollowUpAction,
  WorkspaceFollowUpEvaluation,
  WorkspaceFollowUpStatus,
  WorkspaceRecommendationStatus,
} from '@/lib/workspace-storage';

export interface FollowUpApiAction {
  actionDetail?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  boardStatus: string;
  createdAtUtc: string;
  createdByUserId: string;
  createdByUserName: string;
  deadlineLabel?: string | null;
  description?: string | null;
  endDate: string;
  evaluation: string;
  id: string;
  missionId: string;
  ownerDisplayName?: string | null;
  recommendation?: string | null;
  recommendationNumber?: string | null;
  recommendationStatus: string;
  remarks?: string | null;
  startDate: string;
  status: string;
  title: string;
  updatedAtUtc: string;
}

interface CreateFollowUpPayload {
  actionDetail?: string;
  assignedUserId?: string | null;
  boardStatus: string;
  deadlineLabel?: string;
  description?: string;
  endDate: string;
  evaluation: string;
  missionId: string;
  ownerDisplayName?: string;
  recommendation?: string;
  recommendationNumber?: string;
  recommendationStatus: string;
  remarks?: string;
  startDate: string;
  title: string;
}

function getAuthHeaders(): HeadersInit {
  const token = authClient.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseEvaluation(value: string): WorkspaceFollowUpEvaluation {
  if (value === 'Critique' || value === 'Mineur') {
    return value;
  }

  return 'Modere';
}

function parseRecommendationStatus(value: string): WorkspaceRecommendationStatus {
  if (value === 'accepted' || value === 'not-accepted') {
    return value;
  }

  return 'in-study';
}

function parseBoardStatus(value: string): WorkspaceFollowUpStatus {
  if (value === 'not-due' || value === 'in-progress' || value === 'at-risk' || value === 'completed') {
    return value;
  }

  return 'planning';
}

export function mapApiActionToWorkspaceAction(action: FollowUpApiAction): WorkspaceFollowUpAction {
  return {
    actionDetail: action.actionDetail ?? '',
    deadline: action.deadlineLabel ?? action.endDate,
    description: action.description ?? '',
    endDate: action.endDate,
    evaluation: parseEvaluation(action.evaluation),
    id: action.id,
    missionId: action.missionId ?? null,
    owner: action.ownerDisplayName ?? action.assignedUserName ?? '',
    recommendation: action.recommendation ?? '',
    recommendationNumber: action.recommendationNumber ?? '',
    recommendationStatus: parseRecommendationStatus(action.recommendationStatus),
    remarks: action.remarks ?? '',
    startDate: action.startDate,
    status: parseBoardStatus(action.boardStatus),
    title: action.title,
  };
}

export async function fetchFollowUpActions(): Promise<WorkspaceFollowUpAction[]> {
  const response = await apiRequest<FollowUpApiAction[]>('/api/follow-up-actions', {
    headers: getAuthHeaders(),
    method: 'GET',
  });

  return response.map((action) => mapApiActionToWorkspaceAction(action));
}

export async function createFollowUpAction(payload: CreateFollowUpPayload): Promise<WorkspaceFollowUpAction> {
  const response = await apiRequest<FollowUpApiAction>('/api/follow-up-actions', {
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
    method: 'POST',
  });

  return mapApiActionToWorkspaceAction(response);
}

export async function updateFollowUpBoardStatus(actionId: string, status: WorkspaceFollowUpStatus): Promise<WorkspaceFollowUpAction> {
  const response = await apiRequest<FollowUpApiAction>(`/api/follow-up-actions/${actionId}/board-status`, {
    body: JSON.stringify({ status }),
    headers: getAuthHeaders(),
    method: 'PATCH',
  });

  return mapApiActionToWorkspaceAction(response);
}

export async function updateFollowUpRecommendationStatus(
  actionId: string,
  status: WorkspaceRecommendationStatus
): Promise<WorkspaceFollowUpAction> {
  const response = await apiRequest<FollowUpApiAction>(`/api/follow-up-actions/${actionId}/recommendation-status`, {
    body: JSON.stringify({ status }),
    headers: getAuthHeaders(),
    method: 'PATCH',
  });

  return mapApiActionToWorkspaceAction(response);
}

export async function deleteFollowUpAction(actionId: string): Promise<void> {
  await apiRequest<void>(`/api/follow-up-actions/${actionId}`, {
    headers: getAuthHeaders(),
    method: 'DELETE',
  });
}
