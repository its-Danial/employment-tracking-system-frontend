<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { candidateQueries } from '@/api/services/candidate-services'
import AppCard from '@/components/AppCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import DocumentsPanel from '@/components/candidate/DocumentsPanel.vue'
import NextStepPanel from '@/components/candidate/NextStepPanel.vue'
import PassportDataPage from '@/components/candidate/PassportDataPage.vue'
import StageStamp from '@/components/candidate/StageStamp.vue'
import VisaStamps from '@/components/candidate/VisaStamps.vue'
import LedgerPanel from '@/components/payment/LedgerPanel.vue'
import { formatBackendDateForDisplay, formatRelativeTime } from '@/lib/utils'
import { CANDIDATE_ACTIVITY, type CandidateStage } from '@/shared/candidate'
import type { Candidate, CandidateActivity } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { RouteName } from '@/types/router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const route = useRoute()
const uuid = computed(() => route.params.uuid as Candidate['uuid'])

const { data: candidateRes, isLoading, isError } = candidateQueries.useCandidate(uuid)
const candidate = computed(() => candidateRes.value?.data)

/** "Moved to E-Number" for stage changes, the activity's own label otherwise */
const activityLabel = (activity: CandidateActivity) =>
  activity.activityType === CANDIDATE_ACTIVITY.stageChanged && activity.newValue
    ? t('candidates.movedTo', { stage: t(`stages.${activity.newValue as CandidateStage}`) })
    : t(`activity.${activity.activityType}`)

const formatDate = (date: string | null | undefined) =>
  date ? formatBackendDateForDisplay(date) : null

type Detail = { label: string; value: string | null | undefined; ltr?: boolean }
const sections = computed<{ title: string; details: Detail[] }[]>(() => {
  const c = candidate.value
  if (!c) return []
  return [
    {
      title: t('candidates.placement'),
      details: [
        { label: t('candidates.trade'), value: c.trade?.name },
        {
          label: t('candidates.employer'),
          value: c.company ? `${c.company.name}, ${c.company.country}` : null,
        },
        {
          label: t('candidates.contract'),
          value: c.contract ? `${c.contract.contractNumber}, ${c.contract.title}` : null,
        },
        { label: t('candidates.visaNumber'), value: c.visaNumber, ltr: true },
        { label: t('candidates.medical'), value: t(`medicalStatus.${c.medicalStatus}`) },
        { label: t('candidates.eNumber'), value: c.eNumber, ltr: true },
      ],
    },
    {
      title: t('candidates.travel'),
      details: [
        { label: t('candidates.protectorDate'), value: formatDate(c.protectorDate) },
        { label: t('candidates.protectorNumber'), value: c.protectorRegistrationNumber, ltr: true },
        { label: t('candidates.insurance'), value: c.insurancePolicyNumber, ltr: true },
        { label: t('candidates.flight'), value: c.flightNumber, ltr: true },
        { label: t('candidates.sortFlight'), value: formatDate(c.flightDate) },
        { label: t('candidates.fileDelivered'), value: formatDate(c.fileDeliveredDate) },
      ],
    },
  ]
})
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-6xl flex-col gap-8">
    <router-link
      :to="{ name: RouteName.Candidates }"
      class="flex w-fit items-center gap-2 text-sm text-muted-color hover:text-color"
    >
      <ArrowLeftIcon class="size-4! rtl:-scale-x-100" />
      {{ t('pageTitles.candidates') }}
    </router-link>

    <EmptyState v-if="isError" :message="t('candidates.notFound')" />

    <template v-else>
      <template v-if="candidate">
        <PassportDataPage :candidate>
          <template #actions>
            <StageStamp :candidate class="text-base!" />
            <AccessControl :permission="PERMISSIONS.candidates.update">
              <Button
                as="router-link"
                :to="{ name: RouteName.EditCandidate, params: { uuid: candidate.uuid } }"
                :label="t('candidates.edit')"
                severity="secondary"
                variant="outlined"
              >
                <template #icon><PencilIcon /></template>
              </Button>
            </AccessControl>
          </template>
        </PassportDataPage>
        <VisaStamps :candidate />
      </template>
      <template v-else-if="isLoading">
        <Skeleton height="16rem" border-radius="0.75rem" />
        <Skeleton height="9rem" border-radius="0.75rem" />
      </template>

      <AccessControl v-if="candidate?.nextStep" :permission="PERMISSIONS.candidates.update">
        <NextStepPanel :candidate />
      </AccessControl>

      <div class="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div class="flex flex-col gap-6">
          <section v-for="section in sections" :key="section.title" class="flex flex-col gap-3">
            <h2 class="text-lg font-semibold">{{ section.title }}</h2>
            <AppCard class="p-0!">
              <dl class="divide-y divide-surface-200 dark:divide-surface-800">
                <div
                  v-for="detail in section.details"
                  :key="detail.label"
                  class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3"
                >
                  <dt class="text-muted-color">{{ detail.label }}</dt>
                  <dd
                    :dir="detail.ltr && detail.value ? 'ltr' : undefined"
                    :class="[
                      detail.value ? 'text-color-emphasis' : 'text-muted-color',
                      { 'tabular-nums': detail.ltr },
                    ]"
                    class="rtl:text-right"
                  >
                    {{ detail.value || t('common.notSet') }}
                  </dd>
                </div>
              </dl>
            </AppCard>
          </section>
          <section v-if="candidate?.notes" class="flex flex-col gap-3">
            <h2 class="text-lg font-semibold">{{ t('candidates.notes') }}</h2>
            <AppCard>
              <p class="whitespace-pre-line">{{ candidate.notes }}</p>
            </AppCard>
          </section>
          <section v-if="isLoading" class="flex flex-col gap-3">
            <Skeleton width="8rem" height="1.25rem" />
            <Skeleton height="12rem" border-radius="0.75rem" />
          </section>
        </div>

        <div class="flex flex-col gap-6">
          <section class="flex flex-col gap-3">
            <h2 class="text-lg font-semibold">{{ t('candidates.history') }}</h2>
            <ol class="flex flex-col">
              <template v-if="isLoading">
                <li v-for="n in 4" :key="n" class="flex gap-3 pb-5">
                  <Skeleton shape="circle" size="0.5rem" class="mt-1.5" />
                  <div class="flex flex-1 flex-col gap-2">
                    <Skeleton width="60%" height="0.875rem" />
                    <Skeleton width="35%" height="0.75rem" />
                  </div>
                </li>
              </template>
              <li
                v-for="activity in candidate?.activities"
                v-else
                :key="activity.uuid"
                class="relative flex gap-3 pb-5 before:absolute before:start-[3px] before:top-4 before:bottom-0 before:w-px before:bg-surface-200 last:before:hidden dark:before:bg-surface-800"
              >
                <span
                  class="mt-1.5 size-[7px] shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span class="flex flex-col gap-0.5">
                  <span class="font-medium text-color-emphasis">
                    {{ activityLabel(activity) }}
                  </span>
                  <span class="text-sm text-muted-color">
                    {{ formatBackendDateForDisplay(activity.createdAt) }},
                    {{ formatRelativeTime(activity.createdAt) }}
                    <template v-if="activity.performedBy?.fullName">
                      &ensp;{{ t('candidates.by', { name: activity.performedBy.fullName }) }}
                    </template>
                  </span>
                </span>
              </li>
            </ol>
          </section>

          <AccessControl v-if="candidate" :permission="PERMISSIONS.payments.view">
            <LedgerPanel :candidate />
          </AccessControl>
          <DocumentsPanel v-if="candidate" :candidate />
        </div>
      </div>
    </template>
  </div>
</template>
