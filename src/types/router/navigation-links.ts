import type { MenuItem } from 'primevue/menuitem'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { MessageSchema } from '@/i18n'
import type { Permission } from '@/shared/permissions'

type MenuItemBase = {
  [K in keyof MenuItem]: K extends 'icon' ? string | Component | undefined : MenuItem[K]
} & {
  /** Menu text, a key of `nav` in the locale files */
  labelKey: keyof MessageSchema['nav']
  /** Hidden unless the user has all of these. Should match the target route's `meta.permission` */
  permission?: Permission | Permission[]
  /** Draws a divider above the link, to separate daily work from reference records */
  startsGroup?: boolean
}

interface NavLinkWithoutChildren extends MenuItemBase {
  readonly to: RouteLocationRaw
  readonly items?: never
}

/**
 * Only one level of nesting is allowed, so children can only be {@link NavLinkWithoutChildren}
 * @note When there are children the parent link does not have a `to` property
 */
interface NavLinkWithChildren extends Omit<MenuItemBase, 'items'> {
  readonly items: NavLinkWithoutChildren[]
  readonly to?: never
}

export type NavLink = NavLinkWithChildren | NavLinkWithoutChildren
