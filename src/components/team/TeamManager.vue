<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { type TeamScope, teamQueries } from '@/api/services/team-services'
import AppCard from '@/components/AppCard.vue'
import InitialsAvatar from '@/components/InitialsAvatar.vue'
import FormDialog from '@/components/form/FormDialog.vue'
import FormField from '@/components/form/FormField.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { useEditForm } from '@/composables/use-edit-form'
import { useFormRules } from '@/composables/use-form-rules'
import type { User } from '@/shared/entities'
import type { UUID } from '@/shared/utils'
import { useToastStore } from '@/stores/toast'

/**
 * A company's users: list, add, edit (role, active, new password) and delete. Used by the
 * Team page (the admin's own company) and the platform page (any company). The API enforces
 * the rules, e.g. the last admin can't be removed.
 */
const {
  scope,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  currentUserUuid,
} = defineProps<{
  scope: TeamScope
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  /** Marked "You" in the list */
  currentUserUuid?: UUID
}>()

const { t } = useI18n()
const rules = useFormRules()
const toast = useToastStore()
const confirmDelete = useConfirmDelete()

const { data: usersRes, isLoading } = teamQueries.useUsers(() => scope)
const { data: rolesRes } = teamQueries.useRoles(() => scope)
const saveUser = teamQueries.useSaveUser(() => scope)
const deleteUser = teamQueries.useDeleteUser(() => scope)

// "No role" is a real choice. Select shows a null value as empty, so it's also the placeholder.
const roleOptions = computed(() => [
  { uuid: null, name: t('team.noRole') },
  ...(rolesRes.value?.data ?? []).map((role) => ({ uuid: role.uuid, name: role.name })),
])

// --- Add / edit ---
const isEditing = ref(false)
const editing = ref<User>()
const form = useEditForm(
  () => ({
    fullName: '',
    email: '',
    password: '',
    roleUuid: null as UUID | null,
    isActive: true,
  }),
  () =>
    z.object({
      fullName: rules.text(t('team.name'), { min: 2, max: 100 }),
      email: rules.email(t('team.email')),
      // Required for a new user, optional when editing (empty keeps the current one)
      password: editing.value
        ? z.union([z.literal(''), rules.password(t('team.password'))])
        : rules.password(t('team.password')),
    })
)

function openForm(user?: User) {
  editing.value = user
  form.reset(
    user && {
      fullName: user.fullName ?? '',
      email: user.email,
      roleUuid: user.roleUuid,
      isActive: user.isActive,
    }
  )
  isEditing.value = true
}

async function submit() {
  if (!form.validate()) return
  const { fullName, email, password, roleUuid, isActive } = form.values.value
  try {
    await saveUser.mutateAsync({
      uuid: editing.value?.uuid,
      fullName: fullName.trim(),
      email: email.trim(),
      roleUuid,
      isActive,
      ...(password ? { password } : {}),
    })
    toast.success(editing.value ? t('common.saved') : t('team.added', { name: fullName.trim() }))
    isEditing.value = false
  } catch (error) {
    form.showServerErrors(error)
  }
}

const remove = (user: User) =>
  confirmDelete({
    itemName: user.fullName ?? user.email,
    onConfirm: async () => {
      await deleteUser.mutateAsync(user.uuid)
      toast.success(t('common.deleted'))
    },
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="canCreate" class="flex justify-end">
      <Button :label="t('team.add')" @click="openForm()">
        <template #icon><PlusIcon /></template>
      </Button>
    </div>

    <AppCard class="p-0!">
      <ul class="divide-y divide-surface-200 dark:divide-surface-800" :aria-busy="isLoading">
        <template v-if="isLoading">
          <li v-for="n in 4" :key="n" class="flex items-center gap-3 px-4 py-3">
            <Skeleton shape="circle" size="2.5rem" />
            <div class="flex flex-1 flex-col gap-2">
              <Skeleton width="30%" height="0.875rem" />
              <Skeleton width="45%" height="0.75rem" />
            </div>
          </li>
        </template>
        <li
          v-for="user in usersRes?.data"
          v-else
          :key="user.uuid"
          class="flex items-center gap-3 px-4 py-3"
          :class="{ 'opacity-60': !user.isActive }"
        >
          <InitialsAvatar :name="user.fullName ?? user.email" />
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-center gap-2 truncate font-medium text-color-emphasis">
              {{ user.fullName }}
              <Tag v-if="user.uuid === currentUserUuid" :value="t('team.you')" severity="info" />
            </span>
            <span dir="ltr" class="truncate text-sm text-muted-color rtl:text-right">
              {{ user.email }}
            </span>
          </div>
          <span class="hidden text-sm sm:block">{{ user.role?.name ?? t('nav.noRole') }}</span>
          <Tag v-if="!user.isActive" :value="t('team.inactive')" severity="secondary" />
          <div class="flex shrink-0">
            <Button
              v-if="canUpdate"
              variant="text"
              severity="secondary"
              size="small"
              :aria-label="`${t('common.edit')} ${user.fullName ?? user.email}`"
              @click="openForm(user)"
            >
              <template #icon><PencilIcon /></template>
            </Button>
            <Button
              v-if="canDelete && user.uuid !== currentUserUuid"
              variant="text"
              severity="secondary"
              size="small"
              :aria-label="`${t('common.delete')} ${user.fullName ?? user.email}`"
              class="hover:text-red-600!"
              @click="remove(user)"
            >
              <template #icon><TrashIcon /></template>
            </Button>
          </div>
        </li>
        <li v-if="!isLoading && !usersRes?.data.length" class="p-6 text-center text-muted-color">
          {{ t('team.empty') }}
        </li>
      </ul>
    </AppCard>

    <FormDialog
      v-model:visible="isEditing"
      :title="editing ? t('team.edit') : t('team.add')"
      :saving="saveUser.isPending.value"
      @submit="submit"
    >
      <FormField :label="t('team.name')" for="user-name" :server-error="form.errors.value.fullName">
        <InputText
          id="user-name"
          v-model="form.values.value.fullName"
          :invalid="!!form.errors.value.fullName"
          fluid
        />
      </FormField>
      <FormField :label="t('team.email')" for="user-email" :server-error="form.errors.value.email">
        <InputText
          id="user-email"
          v-model="form.values.value.email"
          type="email"
          dir="ltr"
          autocomplete="off"
          :invalid="!!form.errors.value.email"
          fluid
        />
      </FormField>
      <FormField
        :label="editing ? t('team.newPassword') : t('team.password')"
        for="user-password"
        :optional="!!editing"
        :hint="editing ? t('team.passwordEditHint') : t('team.passwordHint')"
        :server-error="form.errors.value.password"
      >
        <Password
          v-model="form.values.value.password"
          input-id="user-password"
          :feedback="false"
          toggle-mask
          autocomplete="new-password"
          :invalid="!!form.errors.value.password"
          fluid
        />
      </FormField>
      <FormField :label="t('team.role')" for="user-role" :server-error="form.errors.value.roleUuid">
        <Select
          v-model="form.values.value.roleUuid"
          input-id="user-role"
          :options="roleOptions"
          option-label="name"
          option-value="uuid"
          :placeholder="t('team.noRole')"
          fluid
        />
      </FormField>
      <label class="flex items-center gap-3">
        <ToggleSwitch v-model="form.values.value.isActive" />
        {{ t('team.active') }}
      </label>
    </FormDialog>
  </div>
</template>
