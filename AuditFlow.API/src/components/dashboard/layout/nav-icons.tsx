import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { LifebuoyIcon } from '@phosphor-icons/react/dist/ssr/Lifebuoy';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'arrow-clockwise': ArrowClockwiseIcon,
  'chart-pie': ChartPieIcon,
  'check-circle': CheckCircleIcon,
  'file-text': FileTextIcon,
  'gear-six': GearSixIcon,
  lifebuoy: LifebuoyIcon,
  'list-bullets': ListBulletsIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
