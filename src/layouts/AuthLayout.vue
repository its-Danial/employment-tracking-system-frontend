<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ThemeButton from '@/components/ThemeButton.vue'
import { useTenantStore } from '@/stores/tenant'

const { tenant } = storeToRefs(useTenantStore())
</script>

<template>
  <div
    class="relative flex min-h-screen w-full items-center justify-center lg:grid lg:grid-cols-2 lg:items-stretch"
  >
    <div class="hidden justify-center bg-surface-100 px-4 py-8 lg:flex dark:bg-surface-950">
      <div class="mt-[20%] flex max-w-md flex-col gap-2">
        <img v-if="tenant?.logoUrl" :src="tenant?.logoUrl" class="mx-auto mb-5 max-w-sm" />
        <h2 class="text-center text-lg font-semibold text-color-emphasis">{{ tenant?.name }}</h2>
        <h3 v-if="tenant?.tagline" class="text-center">{{ tenant?.tagline }}</h3>
        <p v-if="tenant?.description" class="text-justify text-muted-color">
          {{ tenant?.description }}
        </p>
        <div
          v-if="tenant?.companyWebsite || tenant?.contactEmail || tenant?.contactPhone"
          class="mt-auto flex items-start justify-between gap-2 text-xs"
        >
          <a
            v-if="tenant?.companyWebsite"
            :href="tenant?.companyWebsite"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-color hover:text-muted-color-emphasis"
          >
            {{ tenant?.companyWebsite }}
          </a>
          <div
            v-if="tenant?.contactEmail || tenant?.contactPhone"
            class="flex flex-col items-end gap-1"
          >
            <a
              v-if="tenant?.contactEmail"
              :href="`mailto:${tenant?.contactEmail}`"
              class="text-muted-color hover:text-muted-color-emphasis"
            >
              {{ tenant?.contactEmail }}
            </a>
            <a
              v-if="tenant?.contactPhone"
              :href="`tel:${tenant?.contactPhone}`"
              class="text-muted-color hover:text-muted-color-emphasis"
            >
              {{ tenant?.contactPhone }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <main class="flex w-full items-center justify-center p-8 md:p-12">
      <router-view />
    </main>
    <ThemeButton class="absolute top-4 right-4" />
  </div>
</template>
