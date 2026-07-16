'use client';

import { apiRequest } from '@/lib/api/http';
import { authClient } from '@/lib/auth/client';

interface MissionApiResponse {
  dueDate: string;
  id: string;
  reference: string;
  title: string;
}

export interface MissionLookupItem {
  databaseId: string;
  date: string;
  missionId: string;
  subject: string;
}

function getAuthHeaders(): HeadersInit {
  const token = authClient.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMissionLookupItems(): Promise<MissionLookupItem[]> {
  const response = await apiRequest<MissionApiResponse[]>('/api/missions', {
    headers: getAuthHeaders(),
    method: 'GET',
  });

  return response.map((mission) => ({
    databaseId: mission.id,
    date: mission.dueDate,
    missionId: mission.reference,
    subject: mission.title,
  }));
}
