<script setup lang="ts">
import { storeToRefs } from 'pinia'
import CompanyMark from '@/components/CompanyMark.vue'
import GuillochePattern from '@/components/GuillochePattern.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeButton from '@/components/ThemeButton.vue'
import { useTenantStore } from '@/stores/tenant'

const { tenant } = storeToRefs(useTenantStore())
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-[11fr_9fr]">
    <!-- Company cover: green like a passport, with the company's own gold print -->
    <aside
      class="relative isolate flex flex-col justify-between gap-10 overflow-hidden bg-passport p-6 text-passport-ink sm:p-10 lg:p-14"
    >
      <GuillochePattern
        :seed="tenant?.subdomain ?? ''"
        animate
        class="absolute -end-28 top-1/2 -z-10 size-[26rem] -translate-y-1/2 text-gold-400/50 sm:-end-20 lg:-end-[12%] lg:size-[min(110vh,56rem)] lg:text-gold-400/60"
      />

      <div class="size-12 lg:size-14">
        <CompanyMark :name="tenant?.name" :logo-url="tenant?.logoUrl" class="text-lg" />
      </div>

      <div class="flex max-w-md flex-col gap-4">
        <h1
          class="text-3xl leading-[1.05] font-bold tracking-tight text-balance sm:text-4xl lg:text-6xl"
        >
          {{ tenant?.name }}
        </h1>
        <p v-if="tenant?.tagline" class="text-base text-gold-300 lg:text-lg">
          {{ tenant?.tagline }}
        </p>
        <p
          v-if="tenant?.description"
          class="hidden max-w-sm leading-relaxed text-passport-muted lg:block"
        >
          {{ tenant?.description }}
        </p>
        <div
          v-if="tenant?.companyWebsite || tenant?.contactEmail || tenant?.contactPhone"
          class="mt-4 hidden flex-wrap gap-x-6 gap-y-1 text-sm text-passport-muted lg:flex"
        >
          <a
            v-if="tenant?.companyWebsite"
            :href="tenant?.companyWebsite"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-passport-ink"
          >
            {{ tenant?.companyWebsite.replace(/^https?:\/\//, '') }}
          </a>
          <a
            v-if="tenant?.contactEmail"
            :href="`mailto:${tenant?.contactEmail}`"
            class="hover:text-passport-ink"
          >
            {{ tenant?.contactEmail }}
          </a>
          <a
            v-if="tenant?.contactPhone"
            :href="`tel:${tenant?.contactPhone}`"
            dir="ltr"
            class="hover:text-passport-ink"
          >
            {{ tenant?.contactPhone }}
          </a>
        </div>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <div class="flex items-center justify-end gap-3 p-4">
        <LanguageSwitcher />
        <ThemeButton />
      </div>
      <main class="flex flex-1 items-center justify-center px-6 pt-4 pb-16 sm:px-12">
        <router-view />
      </main>
    </div>
  </div>
</template>
