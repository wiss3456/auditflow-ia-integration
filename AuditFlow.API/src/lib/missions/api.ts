'use client';

import { apiRequest } from '@/lib/api/http';
import { authClient } from '@/lib/auth/client';



export interface CreateMissionPayload {
  client: string;
  description: string;
  dueDate: string;
  objective: string;
  ownerUserId: string | null;
  reference: string;
  scope: string;
  site: string;
  title: string;
}

export interface BackendMissionResponse {
  id: string;
  reference: string;
  title: string;
  client: string;
  site: string;
  objective: string;
  scope: string;
  description: string;
  dueDate: string;
}
export async function updateRiskDecision(riskId: string, status: string): Promise<void> {
  await apiRequest<void>(`/api/risks/${riskId}/decision`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}

export async function createMission(payload: CreateMissionPayload): Promise<BackendMissionResponse> {
  return apiRequest<BackendMissionResponse>('/api/missions', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${authClient.getToken() ?? ''}`,
    },
  });
}



export interface MissionLookupItem {
  databaseId: string;
  date: string;
  missionId: string;
  subject: string;
}

export async function fetchMissionLookupItems(): Promise<MissionLookupItem[]> {
  const missions = await apiRequest<BackendMissionResponse[]>('/api/missions', {
    method: 'GET',
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });

  return missions.map((m) => ({
    databaseId: m.id,
    date: m.dueDate,
    missionId: m.reference,
    subject: m.title,
  }));
}



export interface BackendRiskEntry {
  id: string;
  objetAuditable: string;
  sousObjetAuditable: string;
  risque: string;
  bonnePratique: string;
  evaluation: string;
  decisionStatus: string;
}

export async function generateRisks(missionId: string): Promise<BackendRiskEntry[]> {
  return apiRequest<BackendRiskEntry[]>(`/api/missions/${missionId}/risks/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}

export async function fetchRisks(missionId: string): Promise<BackendRiskEntry[]> {
  return apiRequest<BackendRiskEntry[]>(`/api/missions/${missionId}/risks`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}
export interface BackendVerificationTest {
  id: string;
  tache: string;
  objectif: string;
  methodologie: string;
  status: string;
}

export async function generateVerification(missionId: string): Promise<BackendVerificationTest[]> {
  return apiRequest<BackendVerificationTest[]>(`/api/missions/${missionId}/verification/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}
export async function updateVerificationTest(
  testId: string,
  payload: {
    testNumber: string; tache: string; objectif: string; methodologie: string;
    auditor: string; status: string; startDate: string; endDate: string;
    comments: string; action: string; isNonConformity: boolean;
  }
): Promise<BackendVerificationTest> {
  return apiRequest<BackendVerificationTest>(`/api/verification-tests/${testId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}
export async function fetchVerificationTests(missionId: string): Promise<BackendVerificationTest[]> {
  return apiRequest<BackendVerificationTest[]>(`/api/missions/${missionId}/verification`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${authClient.getToken() ?? ''}` },
  });
}