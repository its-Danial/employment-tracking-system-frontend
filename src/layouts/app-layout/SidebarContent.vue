<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import type { MenuItem } from 'primevue/menuitem'
import { type Component, markRaw, useTemplateRef } from 'vue'
import { sidebarLinks } from '@/router/links/navigation-links'
import { useUserStore } from '@/stores/user'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const { isSideBarOpen } = defineProps<{
  isSideBarOpen: boolean
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMediumScreen = breakpoints.greater('md')

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const userMenuRef = useTemplateRef('userMenuRef')

const userMenuItems: (MenuItem & { iconComponent?: Component })[] = [
  {
    label: 'Profile',
    items: [
      {
        label: 'Logout',
        iconComponent: markRaw(ArrowRightStartOnRectangleIcon),
        command: () => userStore.logout(),
      },
    ],
  },
]
</script>

<template>
  <div
    class="sidebar-content flex size-full flex-col bg-surface-100 transition dark:bg-surface-950"
  >
    <!-- Sidebar header -->
    <header
      class="flex h-(--header-height) items-center border-b border-surface p-(--sidebar-item-padding)"
    >
      <div
        class="flex w-full items-center gap-2 rounded-border text-sm"
        :class="{ 'p-2': isSideBarOpen }"
      >
        <!-- Logo/Icon -->
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary-500 leading-0 tracking-tighter text-primary-50"
        >
          ETS
        </div>

        <!-- Company info -->
        <div
          class="flex flex-1 flex-col overflow-hidden text-left text-sm leading-tight transition-all duration-300 ease-in-out"
          :class="{ 'w-0 opacity-0': !isSideBarOpen, 'w-full opacity-100': isSideBarOpen }"
        >
          <span class="truncate font-semibold">Your Company</span>
          <span class="truncate text-xs text-muted-color">Enterprise</span>
        </div>
      </div>
    </header>

    <!-- Navigation content -->
    <menu class="flex-1 overflow-auto p-(--sidebar-item-padding)">
      <div
        :class="[
          'h-8 p-2 text-xs font-medium text-muted-color transition-[margin,opacity] duration-300 ease-in-out',
          { '-mt-8 opacity-0': !isSideBarOpen },
        ]"
      >
        Navigation
      </div>
      <PanelMenu
        :model="sidebarLinks as MenuItem[]"
        :expandedKeys="!isSideBarOpen ? {} : undefined"
        :pt="{
          root: { class: 'gap-1' },
          panel: {
            class: 'p-0 rounded-border border-0 bg-transparent',
          },
        }"
      >
        <template #item="{ item, hasSubmenu, active }">
          <component
            :is="hasSubmenu ? 'div' : 'router-link'"
            v-bind="hasSubmenu ? {} : { to: item.to }"
            class="flex cursor-pointer items-center rounded-md p-2 text-sm text-muted-color-emphasis transition-colors duration-200 ease-in-out hover:bg-surface-200 dark:hover:bg-surface-800"
          >
            <component :is="item.icon" />
            <div
              class="flex flex-1 items-center justify-between overflow-hidden transition-all duration-300 ease-in-out"
              :class="{ 'w-0 opacity-0': !isSideBarOpen, 'ml-2 w-full opacity-100': isSideBarOpen }"
            >
              <span class="truncate">{{ item.label }}</span>
              <ChevronRightIcon
                v-if="hasSubmenu"
                class="shrink-0 transition-transform duration-300 ease-in-out"
                :class="{ 'rotate-90': active }"
              />
            </div>
          </component>
        </template>
      </PanelMenu>
    </menu>

    <!-- User section -->
    <div id="user-menu" class="p-(--sidebar-item-padding)">
      <Button
        variant="text"
        severity="contrast"
        class="relative flex w-full items-center gap-0 rounded-border border-0 text-sm"
        :class="isSideBarOpen ? 'h-(--sidebar-open-user-menu-height) p-2' : 'h-fit p-0'"
        aria-haspopup="true"
        aria-controls="overlay_user_menu"
        @click="userMenuRef?.toggle"
      >
        <Avatar :label="user?.fullName[0]" />
        <div
          class="flex flex-1 flex-col overflow-hidden text-left text-sm leading-tight transition-all duration-300 ease-in-out"
          :class="{
            'ml-2 w-full opacity-100': isSideBarOpen,
            'w-0 opacity-0': !isSideBarOpen,
          }"
        >
          <span class="truncate font-semibold">{{ user?.fullName }}</span>
          <span class="truncate text-xs text-muted-color">{{ user?.email }}</span>
        </div>
      </Button>
    </div>
  </div>
  <Menu
    ref="userMenuRef"
    id="overlay_user_menu"
    append-to="#user-menu"
    :model="userMenuItems"
    popup
    :pt="{
      root: {
        class: {
          '-mt-2!': !isMediumScreen && isSideBarOpen,
          'mt-(--sidebar-open-user-menu-height)! ml-(--sidebar-width-open)':
            isSideBarOpen && isMediumScreen,
          'mt-(--sidebar-closed-user-menu-height)! ml-(--sidebar-width-closed)':
            !isSideBarOpen && isMediumScreen,
        },
      },
    }"
  >
    <template #itemicon="{ item }">
      <component v-if="item.iconComponent" :is="item.iconComponent" />
    </template>
  </Menu>
</template>

<style scoped>
.sidebar-content {
  --sidebar-item-padding: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
  --sidebar-open-user-menu-height: calc(var(--spacing) * 12) /* 3rem = 48px */;
  --sidebar-closed-user-menu-height: calc(var(--spacing) * 8) /* 2rem = 32px (after removing p-2) */;
}
</style>
