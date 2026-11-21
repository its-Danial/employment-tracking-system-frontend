<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GuillochePattern from '@/components/GuillochePattern.vue'
import { ageFrom, formatBackendDateForDisplay, initialsOf } from '@/lib/utils'
import type { Candidate } from '@/shared/entities'

/**
 * The candidate's identity laid out like the data page of a passport: photo, fields and the
 * two machine-readable lines along the bottom edge.
 */
const { candidate } = defineProps<{ candidate: Candidate }>()
const { t } = useI18n()

const fields = computed(() => [
  { label: t('candidates.passport'), value: candidate.passportNumber, ltr: true },
  { label: t('candidates.cnic'), value: candidate.cnicNumber, ltr: true },
  {
    label: t('candidates.dateOfBirth'),
    value: `${formatBackendDateForDisplay(candidate.dateOfBirth)} (${t('candidates.age', { age: ageFrom(candidate.dateOfBirth) })})`,
  },
  { label: t('candidates.phone'), value: candidate.phoneNumber, ltr: true },
  { label: t('candidates.trade'), value: candidate.trade?.name },
  { label: t('candidates.agent'), value: candidate.agent?.name ?? t('candidates.direct') },
])

/** Check digit used in machine-readable passport lines (weights 7, 3, 1) */
function checkDigit(text: string) {
  const valueOf = (char: string) =>
    char === '<' ? 0 : /\d/.test(char) ? +char : char.charCodeAt(0) - 55
  return [...text].reduce((sum, char, i) => sum + valueOf(char) * [7, 3, 1][i % 3]!, 0) % 10
}

/** The two 44-character lines printed at the bottom of a passport, built from this record */
const machineLines = computed(() => {
  const clean = (text: string) => text.toUpperCase().replace(/[^A-Z ]/g, '')
  const names = clean(candidate.name).split(/\s+/).filter(Boolean)
  const surname = names.pop() ?? ''
  const line1 = `P<PAK${surname}<<${names.join('<')}`.padEnd(44, '<').slice(0, 44)
  const number = candidate.passportNumber.padEnd(9, '<')
  const birth = candidate.dateOfBirth.slice(2).replace(/-/g, '')
  const line2 = `${number}${checkDigit(number)}PAK${birth}${checkDigit(birth)}`
    .padEnd(44, '<')
    .slice(0, 44)
  return [line1, line2]
})
</script>

<template>
  <section
    class="relative isolate overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
    :aria-label="t('candidates.dataPage')"
  >
    <GuillochePattern
      :seed="candidate.uuid"
      class="pointer-events-none absolute -end-24 -top-28 -z-10 size-[26rem] text-gold-500/20 dark:text-gold-400/10"
    />

    <div class="flex flex-col gap-6 p-5 sm:flex-row sm:p-7">
      <!-- Photo window, like the one cut into a passport page -->
      <div
        class="flex aspect-[4/5] w-28 shrink-0 items-center justify-center rounded-md border border-surface-300 bg-surface-50 text-3xl font-bold tracking-tight text-primary select-none sm:w-36 dark:border-surface-700 dark:bg-surface-950"
        aria-hidden="true"
      >
        {{ initialsOf(candidate.name) }}
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div class="flex min-w-0 flex-col gap-1">
            <h1
              class="text-3xl leading-[1.1] font-bold tracking-tight text-balance text-color-emphasis sm:text-4xl"
            >
              {{ candidate.name }}
            </h1>
            <p class="text-muted-color">
              {{ t('candidates.sonOf', { name: candidate.fatherName }) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <slot name="actions" />
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          <div v-for="field in fields" :key="field.label" class="flex min-w-0 flex-col gap-0.5">
            <dt class="text-sm text-muted-color">{{ field.label }}</dt>
            <dd
              :dir="field.ltr && field.value ? 'ltr' : undefined"
              class="truncate font-medium rtl:text-right"
              :class="[
                field.value ? 'text-color-emphasis' : 'text-muted-color',
                { 'tabular-nums': field.ltr },
              ]"
            >
              {{ field.value || t('common.notSet') }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Machine-readable zone: decorative, the same data is in the fields above -->
    <div
      dir="ltr"
      aria-hidden="true"
      class="machine-zone overflow-hidden border-t border-surface-200 bg-surface-50 px-5 py-3 text-muted-color select-none sm:px-7 dark:border-surface-800 dark:bg-surface-950/60"
    >
      <p v-for="line in machineLines" :key="line" class="whitespace-nowrap">{{ line }}</p>
    </div>
  </section>
</template>

<style scoped>
.machine-zone {
  font-family: 'OCR B', 'OCR-B', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: clamp(0.625rem, 1.55vw, 1rem);
  letter-spacing: 0.22em;
  line-height: 1.7;
}
</style>
