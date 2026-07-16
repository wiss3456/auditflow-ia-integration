'use client';

import * as React from 'react';
import Box from '@mui/material/Box';

export interface BrandMarkProps {
  size?: number;
  withShadow?: boolean;
}

export function BrandMark({ size = 34, withShadow = true }: BrandMarkProps): React.JSX.Element {
  const surfaceGradientId = React.useId();
  const accentGradientId = React.useId();
  const glowGradientId = React.useId();

  return (
    <Box
      component="svg"
      viewBox="0 0 72 72"
      sx={{
        display: 'block',
        filter: withShadow ? 'drop-shadow(0 12px 22px rgba(45, 99, 255, 0.24))' : 'none',
        flex: '0 0 auto',
        height: size,
        width: size,
      }}
    >
      <defs>
        <linearGradient id={surfaceGradientId} x1="10%" x2="88%" y1="8%" y2="92%">
          <stop offset="0%" stopColor="#18213f" />
          <stop offset="52%" stopColor="#243566" />
          <stop offset="100%" stopColor="#344f9e" />
        </linearGradient>
        <linearGradient id={accentGradientId} x1="18%" x2="86%" y1="20%" y2="84%">
          <stop offset="0%" stopColor="#49d6c6" />
          <stop offset="55%" stopColor="#43b8ef" />
          <stop offset="100%" stopColor="#6b78ff" />
        </linearGradient>
        <radialGradient id={glowGradientId} cx="30%" cy="18%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.58)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <rect fill={`url(#${surfaceGradientId})`} height="64" rx="20" width="64" x="4" y="4" />
      <rect fill={`url(#${glowGradientId})`} height="32" opacity="0.75" rx="18" width="44" x="10" y="8" />
      <rect fill="none" height="63" opacity="0.18" rx="19.5" stroke="#ffffff" width="63" x="4.5" y="4.5" />

      <path
        d="M36 15.5 51.5 22v13.2c0 12.2-7 22.2-15.5 26.7-8.5-4.5-15.5-14.5-15.5-26.7V22L36 15.5Z"
        fill="rgba(255,255,255,0.92)"
      />
      <path
        d="m29.6 35.8 4.9 5.1 9-10.1"
        fill="none"
        stroke={`url(#${accentGradientId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.8"
      />

      <path
        d="M48.4 19.8h6.3c2.1 0 3.8 1.7 3.8 3.8v7.1"
        fill="none"
        opacity="0.9"
        stroke={`url(#${accentGradientId})`}
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx="48.4" cy="19.8" fill={`url(#${accentGradientId})`} r="2.9" />
      <circle cx="58.5" cy="30.7" fill={`url(#${accentGradientId})`} r="2.9" />

      <path
        d="M22.7 49.2h-7.1a3.8 3.8 0 0 1-3.8-3.8v-6.9"
        fill="none"
        opacity="0.85"
        stroke={`url(#${accentGradientId})`}
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx="22.7" cy="49.2" fill={`url(#${accentGradientId})`} r="2.9" />
      <circle cx="11.7" cy="38.5" fill={`url(#${accentGradientId})`} r="2.9" />
    </Box>
  );
}
