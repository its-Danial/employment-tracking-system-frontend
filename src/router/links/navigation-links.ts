import { markRaw } from 'vue'
import { RouteName } from '@/types/router'
import type { NavLink } from '@/types/router/navigation-links'
import { ChartBarIcon } from '@heroicons/vue/24/outline'

export const sidebarLinks: NavLink[] = [
  {
    icon: markRaw(ChartBarIcon),
    label: 'Dashboard',
    to: { name: RouteName.Dashboard },
  },
  {
    icon: markRaw(ChartBarIcon),
    label: 'Dashboard',
    items: [
      {
        icon: markRaw(ChartBarIcon),
        label: 'Dashboard',
        to: { name: RouteName.Dashboard },
      },
    ],
  },
]
