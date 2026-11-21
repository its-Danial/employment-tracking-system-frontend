<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { candidateQueries } from '@/api/services/candidate-services'
import AppCard from '@/components/AppCard.vue'
import MeterBar from '@/components/MeterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { type AppLocale, LOCALES } from '@/i18n'
import { formatRelativeTime } from '@/lib/utils'
import { CANDIDATE_STAGE, CANDIDATE_STAGE_ORDER } from '@/shared/candidate'
import { RouteName } from '@/types/router'

const { t, locale } = useI18n()
const { data: dashboardRes, isLoading } = candidateQueries.useDashboard()
const dashboard = computed(() => dashboardRes.value?.data)

const pipeline = computed(() =>
  CANDIDATE_STAGE_ORDER.map((stage) => ({
    stage,
    count: dashboard.value?.stageCounts[stage] ?? 0,
  }))
)

/** Day number and month for the flight date block, e.g. "14" and "Nov" */
const flightDay = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(year!, month! - 1, day!)
  const dateLocale = LOCALES[locale.value as AppLocale].dateLocale
  return {
    day: value.toLocaleDateString(dateLocale, { day: 'numeric' }),
    month: value.toLocaleDateString(dateLocale, { month: 'short' }),
  }
}
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-7xl flex-col gap-8">
    <PageHeader
      :title="t('pageTitles.dashboard')"
      :subtitle="
        dashboard
          ? `${t('dashboard.subtitle')} ${t('dashboard.inProcess', { count: dashboard.totalCandidates })}`
          : t('dashboard.subtitle')
      "
    />

    <!-- The pipeline: one column per stage, left to right like the journey itself -->
    <section
      class="overflow-x-auto rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
      :aria-label="t('candidates.progress')"
    >
      <ol class="grid min-w-[50rem] grid-cols-8">
        <li
          v-for="({ stage, count }, index) in pipeline"
          :key="stage"
          class="border-surface-200 not-first:border-s dark:border-surface-800"
        >
          <router-link
            :to="{ name: RouteName.Candidates, query: { stage } }"
            :aria-label="t('dashboard.openStage', { stage: t(`stages.${stage}`) })"
            class="group relative flex h-full flex-col gap-6 px-4 pt-5 pb-4 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/60"
          >
            <!-- Route line with a stop for each stage -->
            <span class="relative flex h-2 items-center" aria-hidden="true">
              <span
                class="absolute h-px bg-surface-300 dark:bg-surface-700"
                :class="[
                  index === 0 ? 'start-1' : '-start-4',
                  index === pipeline.length - 1 ? 'end-full' : '-end-4',
                ]"
              />
              <span
                class="relative size-2 rounded-full ring-4 ring-surface-0 dark:ring-surface-900"
                :class="stage === CANDIDATE_STAGE.departed ? 'bg-gold-500' : 'bg-primary'"
              />
            </span>
            <span class="flex flex-col gap-1">
              <Skeleton v-if="isLoading" width="3rem" height="2.25rem" />
              <span
                v-else
                class="text-4xl leading-none font-semibold tracking-tight tabular-nums"
                :class="
                  stage === CANDIDATE_STAGE.departed
                    ? 'text-gold-600 dark:text-gold-300'
                    : 'text-color-emphasis'
                "
              >
                {{ count }}
              </span>
              <span class="text-sm text-muted-color group-hover:text-color">
                {{ t(`stages.${stage}`) }}
              </span>
            </span>
          </router-link>
        </li>
      </ol>
    </section>

    <div class="grid gap-3 sm:grid-cols-3">
      <AppCard class="gap-1">
        <span class="text-sm text-muted-color">{{ t('dashboard.departedRecently') }}</span>
        <Skeleton v-if="isLoading" width="2.5rem" height="1.75rem" />
        <span v-else class="text-2xl font-semibold tabular-nums">
          {{ dashboard?.departedLast30Days }}
        </span>
      </AppCard>
      <AppCard
        :to="{ name: RouteName.Candidates, query: { needsAttention: 'true' } }"
        class="gap-1"
      >
        <span class="text-sm text-muted-color">{{ t('dashboard.blocked') }}</span>
        <Skeleton v-if="isLoading" width="2.5rem" height="1.75rem" />
        <span
          v-else
          class="text-2xl font-semibold tabular-nums"
          :class="{ 'text-red-600 dark:text-red-400': dashboard?.blockedCount }"
        >
          {{ dashboard?.blockedCount }}
        </span>
        <span class="text-sm text-muted-color">{{ t('dashboard.blockedHint') }}</span>
      </AppCard>
      <AppCard :to="{ name: RouteName.Contracts }" class="gap-1">
        <span class="text-sm text-muted-color">{{ t('dashboard.visasUsed') }}</span>
        <Skeleton v-if="isLoading" width="5rem" height="1.75rem" />
        <span v-else class="text-2xl font-semibold tabular-nums">
          {{
            t('dashboard.visasUsedValue', {
              allocated: dashboard?.visas.allocated,
              total: dashboard?.visas.total,
            })
          }}
        </span>
        <MeterBar
          :value="dashboard?.visas.allocated ?? 0"
          :max="dashboard?.visas.total ?? 0"
          :label="t('dashboard.visasUsed')"
          class="mt-2"
        />
      </AppCard>
    </div>

    <div class="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <section class="flex flex-col gap-3">
        <h2 class="text-lg font-semibold">{{ t('dashboard.flyingSoon') }}</h2>
        <div
          class="divide-y divide-surface-200 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:divide-surface-800 dark:border-surface-800 dark:bg-surface-900"
        >
          <template v-if="isLoading">
            <div v-for="n in 4" :key="n" class="flex items-center gap-4 p-4">
              <Skeleton width="2.75rem" height="2.75rem" />
              <div class="flex flex-1 flex-col gap-2">
                <Skeleton width="40%" height="0.875rem" />
                <Skeleton width="65%" height="0.75rem" />
              </div>
            </div>
          </template>
          <router-link
            v-for="candidate in dashboard?.upcomingFlights"
            v-else
            :key="candidate.uuid"
            :to="{ name: RouteName.Candidate, params: { uuid: candidate.uuid } }"
            class="flex items-center gap-4 p-4 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/60"
          >
            <span
              class="flex size-11 shrink-0 flex-col items-center justify-center rounded-md border border-gold-500/50 leading-none text-gold-600 dark:text-gold-300"
            >
              <span class="text-base font-semibold">{{
                flightDay(candidate.flightDate!).day
              }}</span>
              <span class="text-xs">{{ flightDay(candidate.flightDate!).month }}</span>
            </span>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="truncate font-medium text-color-emphasis">{{ candidate.name }}</span>
              <span class="truncate text-sm text-muted-color">
                {{ candidate.trade?.name }}, {{ candidate.company?.name }}
              </span>
            </span>
            <span dir="ltr" class="text-sm text-muted-color tabular-nums">
              {{ candidate.flightNumber }}
            </span>
          </router-link>
          <p
            v-if="!isLoading && !dashboard?.upcomingFlights.length"
            class="p-6 text-center text-muted-color"
          >
            {{ t('dashboard.noFlights') }}
          </p>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-lg font-semibold">{{ t('dashboard.latest') }}</h2>
        <ol class="flex flex-col">
          <template v-if="isLoading">
            <li v-for="n in 5" :key="n" class="flex gap-3 pb-5">
              <Skeleton shape="circle" size="0.5rem" class="mt-1.5" />
              <div class="flex flex-1 flex-col gap-2">
                <Skeleton width="70%" height="0.875rem" />
                <Skeleton width="30%" height="0.75rem" />
              </div>
            </li>
          </template>
          <li
            v-for="activity in dashboard?.recentActivity"
            v-else
            :key="activity.uuid"
            class="relative flex gap-3 pb-5 before:absolute before:start-[3px] before:top-4 before:bottom-0 before:w-px before:bg-surface-200 last:before:hidden dark:before:bg-surface-800"
          >
            <span class="mt-1.5 size-[7px] shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span class="flex flex-col gap-0.5">
              <span>
                <router-link
                  :to="{ name: RouteName.Candidate, params: { uuid: activity.candidate.uuid } }"
                  class="font-medium text-color-emphasis hover:underline"
                >
                  {{ activity.candidate.name }}
                </router-link>
                <span class="text-muted-color">
                  &ensp;{{ t(`activity.${activity.activityType}`) }}
                </span>
              </span>
              <span class="text-sm text-muted-color">
                {{ formatRelativeTime(activity.createdAt) }}
                <template v-if="activity.performedBy?.fullName">
                  &ensp;{{ t('candidates.by', { name: activity.performedBy.fullName }) }}
                </template>
              </span>
            </span>
          </li>
          <li v-if="!isLoading && !dashboard?.recentActivity.length" class="text-muted-color">
            {{ t('dashboard.noActivity') }}
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
