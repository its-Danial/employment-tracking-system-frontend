import type { MessageSchema } from '@/i18n'
import type { Permission } from '@/shared/permissions'
import type { RouteName } from '.'

declare module 'vue-router' {
  interface RouteMeta {
    /** Browser tab title, a key of `pageTitles` in the locale files */
    titleKey?: keyof MessageSchema['pageTitles']
    /** Platform admin pages: work without a company (tenant) */
    platform?: boolean
    /** User needs all of these to open the route, see the `authorize` guard */
    permission?: Permission | Permission[]
  }
  interface TypesConfig {
    RouteNamedMap: {
      [key in RouteName]: RouteRecordInfo<RouteName[key]>
    }
  }
}
