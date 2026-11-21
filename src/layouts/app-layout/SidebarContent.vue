<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { MenuItem } from 'primevue/menuitem'
import { type Component, computed, markRaw, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import CompanyMark from '@/components/CompanyMark.vue'
import GuillochePattern from '@/components/GuillochePattern.vue'
import { initialsOf } from '@/lib/utils'
import { sidebarLinks } from '@/router/links/navigation-links'
import { useTenantStore } from '@/stores/tenant'
import { useUserStore } from '@/stores/user'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline'

const { isSideBarOpen } = defineProps<{ isSideBarOpen: boolean }>()

const { t } = useI18n()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const { tenant } = storeToRefs(useTenantStore())

// Links the user has no permission for are not shown at all
const visibleLinks = computed(() =>
  sidebarLinks
    .filter((link) => !link.permission || userStore.can(link.permission))
    .map((link) => ({
      key: link.labelKey,
      to: link.to!,
      icon: link.icon as Component,
      startsGroup: !!link.startsGroup,
      label: t(`nav.${link.labelKey}`),
    }))
)

const userMenuRef = useTemplateRef('userMenuRef')
const userMenuItems = computed<(MenuItem & { iconComponent?: Component })[]>(() => [
  {
    label: t('common.logout'),
    iconComponent: markRaw(ArrowRightStartOnRectangleIcon),
    command: () => userStore.logout(),
  },
])
</script>

<template>
  <!-- The passport cover: company colour with its gold print, darker in dark mode so it doesn't glare -->
  <div
    class="relative isolate flex size-full flex-col overflow-hidden bg-passport text-passport-ink dark:bg-[color-mix(in_oklab,var(--color-passport),black_38%)]"
  >
    <GuillochePattern
      :seed="tenant?.subdomain ?? ''"
      class="pointer-events-none absolute -start-24 -bottom-28 -z-10 size-80 text-gold-400/25"
    />

    <header class="flex h-16 shrink-0 items-center gap-3 px-3">
      <div class="size-9 shrink-0 text-sm">
        <CompanyMark :name="tenant?.name" :logo-url="tenant?.logoUrl" />
      </div>
      <div v-if="isSideBarOpen" class="flex min-w-0 flex-col leading-tight">
        <span class="truncate font-semibold">{{ tenant?.name }}</span>
        <span class="truncate text-sm text-passport-muted">
          {{ user?.role?.name ?? t('nav.noRole') }}
        </span>
      </div>
    </header>

    <nav class="flex-1 overflow-y-auto px-2 pt-4" :aria-label="t('nav.navigation')">
      <ul class="flex flex-col gap-0.5">
        <li
          v-for="link in visibleLinks"
          :key="link.key"
          :class="{ 'mt-3 border-t border-white/10 pt-3': link.startsGroup }"
        >
          <router-link
            :to="link.to"
            :title="isSideBarOpen ? undefined : link.label"
            class="nav-link relative flex h-10 items-center gap-3 rounded-md px-3 text-passport-muted transition-colors duration-150 hover:bg-white/7 hover:text-passport-ink"
            active-class="nav-link-active"
          >
            <component :is="link.icon" class="size-5! shrink-0" />
            <span v-if="isSideBarOpen" class="truncate">{{ link.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div id="user-menu" class="shrink-0 p-2">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-md p-2 text-start transition-colors hover:bg-white/7"
        aria-haspopup="true"
        aria-controls="overlay_user_menu"
        @click="userMenuRef?.toggle"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-gold-300"
        >
          {{ initialsOf(user?.fullName ?? user?.email) }}
        </span>
        <span v-if="isSideBarOpen" class="flex min-w-0 flex-col leading-tight">
          <span class="truncate font-medium">{{ user?.fullName }}</span>
          <span class="truncate text-sm text-passport-muted">{{ user?.email }}</span>
        </span>
      </button>
    </div>
  </div>
  <Menu ref="userMenuRef" id="overlay_user_menu" :model="userMenuItems" popup>
    <template #itemicon="{ item }">
      <component v-if="item.iconComponent" :is="item.iconComponent" />
    </template>
  </Menu>
</template>

<style scoped>
/* Active page: cream text on a lifted band, marked with a gold rule like a passport page edge */
.nav-link-active {
  background: rgb(255 255 255 / 0.1);
  color: var(--color-passport-ink);
  font-weight: 500;
}
.nav-link-active::before {
  content: '';
  position: absolute;
  inset-block: 0.625rem;
  inset-inline-start: 0;
  width: 2px;
  border-radius: 1px;
  background: var(--color-gold-400);
}
</style>
