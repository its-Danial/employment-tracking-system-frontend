<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AccessControl from '@/components/access/AccessControl.vue'
import type { Permission } from '@/shared/permissions'

/** Edit and delete buttons for a card, each shown only to people allowed to use it */
defineProps<{ name: string; editPermission: Permission; deletePermission: Permission }>()
defineEmits<{ edit: []; delete: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="-me-2 -mt-1 flex shrink-0" role="group" :aria-label="t('common.actions', { name })">
    <AccessControl :permission="editPermission">
      <Button
        variant="text"
        severity="secondary"
        size="small"
        :aria-label="`${t('common.edit')} ${name}`"
        @click.prevent.stop="$emit('edit')"
      >
        <template #icon><PencilIcon /></template>
      </Button>
    </AccessControl>
    <AccessControl :permission="deletePermission">
      <Button
        variant="text"
        severity="secondary"
        size="small"
        :aria-label="`${t('common.delete')} ${name}`"
        class="hover:text-red-600!"
        @click.prevent.stop="$emit('delete')"
      >
        <template #icon><TrashIcon /></template>
      </Button>
    </AccessControl>
  </div>
</template>
