<script setup lang="ts">
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import { ref } from 'vue'
import ThemeButton from '@/components/ThemeButton.vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import SidebarContent from './SidebarContent.vue'

const breakpoints = useBreakpoints(breakpointsTailwind)

const isMediumScreen = breakpoints.greater('md')
const isSideBarOpen = ref(isMediumScreen.value)

const toggleSidebar = () => (isSideBarOpen.value = !isSideBarOpen.value)
</script>

<template>
  <div class="app-layout relative flex h-full min-h-screen w-full">
    <!-- Desktop: Regular fixed sidebar -->
    <aside
      v-if="isMediumScreen"
      :class="[
        'fixed top-0 left-0 h-full border-r border-surface transition-all duration-200 ease-linear',
        isSideBarOpen ? 'w-(--sidebar-width-open)' : 'w-(--sidebar-width-closed)',
      ]"
    >
      <SidebarContent :is-side-bar-open />
    </aside>
    <!-- Mobile: PrimeVue Drawer -->
    <Drawer v-else v-model:visible="isSideBarOpen">
      <template #container>
        <SidebarContent :is-side-bar-open class="app-layout" />
      </template>
    </Drawer>

    <!-- Main content area -->
    <div
      :class="[
        'flex min-h-screen flex-1 flex-col transition-all duration-200 ease-linear',
        {
          'ml-(--sidebar-width-open)': isMediumScreen && isSideBarOpen,
          'ml-(--sidebar-width-closed)': isMediumScreen && !isSideBarOpen,
        },
      ]"
    >
      <!-- Top navigation header -->
      <header
        class="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-surface p-2"
      >
        <!-- Left Content -->
        <div class="flex flex-1 items-center">
          <!-- Sidebar toggle button -->
          <Button
            @click="toggleSidebar"
            :dt="{ padding: { y: 0, x: 0 }, iconOnlyWidth: 'fit' }"
            variant="text"
            class="size-6"
            severity="contrast"
          >
            <template #icon>
              <Bars3Icon />
            </template>
          </Button>
        </div>
        <!-- Right Content -->
        <div class="flex items-center gap-2">
          <!-- Theme toggle button -->
          <ThemeButton />
        </div>
      </header>

      <!-- Main content -->
      <main class="flex flex-1 flex-col overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  --sidebar-width-open: calc(var(--spacing) * 64) /* 16rem = 256px */;
  --sidebar-width-closed: calc(var(--spacing) * 12) /* 3rem = 48px */;
  --header-height: calc(var(--spacing) * 16) /* 4rem = 64px */;
  --header-padding: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
}
</style>
