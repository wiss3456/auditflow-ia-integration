'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import type { AuditMission } from '@/lib/missions/mock-data';
import { getMissionTeamMembers } from '@/lib/missions/team';

interface MissionTeamMembersProps {
  mission: AuditMission;
  size?: number;
}

export function MissionTeamMembers({ mission, size = 30 }: MissionTeamMembersProps): React.JSX.Element {
  const members = React.useMemo(() => getMissionTeamMembers(mission), [mission]);

  return (
    <Stack direction="row" spacing={-0.8}>
      {members.map((member) => (
        <Tooltip key={member.id} title={member.name}>
          <Avatar
            src={member.avatar}
            sx={{
              border: '2px solid #ffffff',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              fontSize: size <= 28 ? '0.72rem' : '0.82rem',
              fontWeight: 700,
              height: size,
              width: size,
            }}
          >
            {member.initials}
          </Avatar>
        </Tooltip>
      ))}
    </Stack>
  );
}
