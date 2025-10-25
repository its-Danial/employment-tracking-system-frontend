import type { MenuItem } from 'primevue/menuitem'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

type MenuItemBase = {
  [K in keyof MenuItem]: K extends 'icon' ? string | Component | undefined : MenuItem[K]
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
