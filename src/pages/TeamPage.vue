<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import TeamManager from '@/components/team/TeamManager.vue'
import { PERMISSIONS } from '@/shared/permissions'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
</script>

<template>
  <div class="page-padding mx-auto flex w-full max-w-4xl flex-col gap-6">
    <PageHeader :title="t('pageTitles.team')" :subtitle="t('team.subtitle')" />
    <TeamManager
      :scope="{ kind: 'company' }"
      :can-create="userStore.can(PERMISSIONS.users.create)"
      :can-update="userStore.can(PERMISSIONS.users.update)"
      :can-delete="userStore.can(PERMISSIONS.users.delete)"
      :current-user-uuid="user?.uuid"
    />
  </div>
</template>
