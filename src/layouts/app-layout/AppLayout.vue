<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Drawer from 'primevue/drawer'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeButton from '@/components/ThemeButton.vue'
import { useLocaleStore } from '@/stores/locale'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { breakpointsTailwind, useBreakpoints, useStorage } from '@vueuse/core'
import SidebarContent from './SidebarContent.vue'

const { t } = useI18n()
const route = useRoute()
const { isRtl } = storeToRefs(useLocaleStore())
const isMediumScreen = useBreakpoints(breakpointsTailwind).greater('md')

// Desktop remembers whether the menu was collapsed, the phone drawer always starts closed
const isDesktopSidebarOpen = useStorage('sidebar-open', true)
const isMobileDrawerOpen = ref(false)
watch(
  () => route.fullPath,
  () => (isMobileDrawerOpen.value = false)
)

function toggleSidebar() {
  if (isMediumScreen.value) isDesktopSidebarOpen.value = !isDesktopSidebarOpen.value
  else isMobileDrawerOpen.value = !isMobileDrawerOpen.value
}
</script>

<template>
  <!-- relative: anything positioned inside stays inside the shell instead of growing the page -->
  <div class="app-layout relative flex h-screen w-screen overflow-hidden">
    <aside
      v-if="isMediumScreen"
      :class="[
        'fixed start-0 top-0 z-1000 h-full transition-[width] duration-200 ease-out',
        isDesktopSidebarOpen ? 'w-(--sidebar-width-open)' : 'w-(--sidebar-width-closed)',
      ]"
    >
      <SidebarContent :is-side-bar-open="isDesktopSidebarOpen" />
    </aside>
    <Drawer
      v-else
      v-model:visible="isMobileDrawerOpen"
      :position="isRtl ? 'right' : 'left'"
      :pt:root:class="'w-(--sidebar-width-open)! border-0!'"
    >
      <template #container>
        <SidebarContent is-side-bar-open />
      </template>
    </Drawer>

    <div
      :class="[
        'flex h-screen min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
        {
          'ms-(--sidebar-width-open)': isMediumScreen && isDesktopSidebarOpen,
          'ms-(--sidebar-width-closed)': isMediumScreen && !isDesktopSidebarOpen,
        },
      ]"
    >
      <header class="flex h-14 shrink-0 items-center gap-2 px-3 md:px-5">
        <Button
          @click="toggleSidebar"
          :aria-label="t('nav.toggleSidebar')"
          variant="text"
          severity="secondary"
          class="size-9"
        >
          <template #icon><Bars3Icon /></template>
        </Button>
        <div class="flex-1" />
        <LanguageSwitcher />
        <ThemeButton />
      </header>

      <main class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  --sidebar-width-open: 15.5rem;
  --sidebar-width-closed: 4.25rem;
}
</style>
