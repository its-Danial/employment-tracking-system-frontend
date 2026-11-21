<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/** "1–12 of 150" with page buttons, hidden entirely when there is nothing to page through */
const { total, perPage } = defineProps<{ total: number; perPage: number }>()
const page = defineModel<number>('page', { required: true })

const { t } = useI18n()
const first = computed(() => (page.value - 1) * perPage)
</script>

<template>
  <div v-if="total > 0" class="flex flex-wrap items-center justify-between gap-3">
    <span class="text-sm text-muted-color tabular-nums">
      {{
        t('common.showingRange', {
          first: first + 1,
          last: Math.min(first + perPage, total),
          total,
        })
      }}
    </span>
    <Paginator
      v-if="total > perPage"
      :rows="perPage"
      :first
      :total-records="total"
      template="PrevPageLink PageLinks NextPageLink"
      :page-link-size="5"
      :pt:root:class="'bg-transparent p-0'"
      @page="page = $event.page + 1"
    />
  </div>
</template>
