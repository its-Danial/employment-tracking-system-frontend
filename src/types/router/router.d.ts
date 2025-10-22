import type { RouteName } from '.'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
  interface TypesConfig {
    RouteNamedMap: {
      [key in RouteName]: RouteRecordInfo<RouteName[key]>
    }
  }
}
