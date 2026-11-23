import { markRaw } from 'vue'
import { PERMISSIONS } from '@/shared/permissions'
import { RouteName } from '@/types/router'
import type { NavLink } from '@/types/router/navigation-links'
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  IdentificationIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

export const sidebarLinks: NavLink[] = [
  {
    icon: markRaw(Squares2X2Icon),
    labelKey: 'dashboard',
    to: { name: RouteName.Dashboard },
    permission: PERMISSIONS.dashboard.view,
  },
  {
    icon: markRaw(UserGroupIcon),
    labelKey: 'candidates',
    to: { name: RouteName.Candidates },
    permission: PERMISSIONS.candidates.view,
  },
  {
    icon: markRaw(DocumentTextIcon),
    labelKey: 'contracts',
    to: { name: RouteName.Contracts },
    permission: PERMISSIONS.contracts.view,
  },
  {
    icon: markRaw(BanknotesIcon),
    labelKey: 'payments',
    to: { name: RouteName.Payments },
    permission: PERMISSIONS.payments.view,
  },
  {
    icon: markRaw(BuildingOffice2Icon),
    labelKey: 'companies',
    to: { name: RouteName.Companies },
    permission: PERMISSIONS.companies.view,
    startsGroup: true,
  },
  {
    icon: markRaw(IdentificationIcon),
    labelKey: 'agents',
    to: { name: RouteName.Agents },
    permission: PERMISSIONS.agents.view,
  },
  {
    icon: markRaw(WrenchScrewdriverIcon),
    labelKey: 'trades',
    to: { name: RouteName.Trades },
    permission: PERMISSIONS.trades.view,
  },
  {
    icon: markRaw(UsersIcon),
    labelKey: 'team',
    to: { name: RouteName.Team },
    permission: PERMISSIONS.users.view,
    startsGroup: true,
  },
]
