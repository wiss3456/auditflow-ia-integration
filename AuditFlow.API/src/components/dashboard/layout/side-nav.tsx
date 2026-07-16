'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';

import { BrandMark } from './brand-mark';
import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const globalItems = navItems.filter((item) => item.key === 'overview' || item.key === 'riskBase' || item.key === 'orientationReport');
  const missionItems = navItems.filter((item) => item.key === 'studyPhase' || item.key === 'followUp');
  const secondaryItems = navItems.filter((item) => item.key === 'support');

  return (
    <Box
      sx={{
        '--SideNav-background': '#f7f8fc',
        '--SideNav-color': '#334155',
        '--NavItem-color': '#4b5563',
        '--NavItem-hover-background': '#eef2ff',
        '--NavItem-active-background': '#eef2ff',
        '--NavItem-active-color': '#4f46e5',
        '--NavItem-disabled-color': '#9ca3af',
        '--NavItem-icon-color': '#64748b',
        '--NavItem-icon-active-color': '#4f46e5',
        '--NavItem-icon-disabled-color': '#94a3b8',
        bgcolor: 'var(--SideNav-background)',
        borderRight: '1px solid rgba(148, 163, 184, 0.18)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{ alignItems: 'center', color: 'inherit', display: 'inline-flex', gap: 1.25, textDecoration: 'none' }}
        >
          <BrandMark />
          <Typography sx={{ color: '#4338ca', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontSize: '1.45rem', fontWeight: 700 }}>
            AuditFlow
          </Typography>
        </Box>
      </Stack>
      <Divider />
      <Box component="nav" sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', gap: 1.5, p: '16px 12px' }}>
        {renderNavItems({ pathname, items: globalItems })}
        <Box
          sx={{
            borderTop: '1px solid rgba(148, 163, 184, 0.16)',
            mt: 0.5,
            pt: 1.4,
          }}
        >
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              lineHeight: 1.55,
              mb: 1.1,
              px: 1.2,
              textTransform: 'uppercase',
            }}
          >
            Pages liees aux missions
          </Typography>
          {renderNavItems({ pathname, items: missionItems })}
        </Box>
      </Box>
      <Divider />
      <Stack spacing={2} sx={{ p: 2 }}>
        <Box component="nav">{renderNavItems({ pathname, items: secondaryItems })}</Box>
      </Stack>
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: '12px',
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          gap: 1,
          p: '10px 14px',
          textDecoration: 'none',
          transition: 'background-color 120ms ease, color 120ms ease',
          ...(disabled && {
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
          '&:hover': {
            bgcolor: 'var(--NavItem-hover-background)',
          },
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Typography component="span" sx={{ color: 'inherit', fontSize: '0.92rem', fontWeight: active ? 700 : 600 }}>
          {title}
        </Typography>
      </Box>
    </li>
  );
}
