<script setup lang="ts">
import { computed } from 'vue'
import type { Permission } from '@/shared/permissions'
import { type PermissionMatch, useUserStore } from '@/stores/user'

/**
 * Renders its content only when the user has the permission(s), otherwise the `fallback` slot.
 * Hiding is for usability only, the API rejects unauthorized requests regardless.
 *
 * @example
 * <AccessControl :permission="PERMISSIONS.trades.create">
 *   <Button label="New" />
 * </AccessControl>
 *
 * @example
 * <AccessControl :permission="[PERMISSIONS.trades.update, PERMISSIONS.trades.delete]" match="any">
 *   ...
 *   <template #fallback>Read only</template>
 * </AccessControl>
 */
const { permission, match = 'all' } = defineProps<{
  permission: Permission | Permission[]
  /** `all` (default) requires every permission, `any` requires at least one */
  match?: PermissionMatch
}>()

defineSlots<{ default(): unknown; fallback?(): unknown }>()

const userStore = useUserStore()
const allowed = computed(() => userStore.can(permission, match))
</script>

<template>
  <slot v-if="allowed" />
  <slot v-else name="fallback" />
</template>
