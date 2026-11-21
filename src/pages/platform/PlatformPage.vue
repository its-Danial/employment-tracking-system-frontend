<script setup lang="ts">
import { isAxiosError } from 'axios'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { platformQueries } from '@/api/services/platform-services'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeButton from '@/components/ThemeButton.vue'
import { useFormRules } from '@/composables/use-form-rules'
import { formatBackendDateForDisplay } from '@/lib/utils'
import type { CreateTenantRequest, PlatformTenant } from '@/shared/platform'
import { usePlatformStore } from '@/stores/platform'
import { useToastStore } from '@/stores/toast'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'

/**
 * Hidden page (not in any menu) for the platform owner to create and manage companies.
 * Access is checked by the API with the platform admin key, this page only asks for it.
 */
const { t } = useI18n()
const toast = useToastStore()
const rules = useFormRules()
const platformStore = usePlatformStore()
const { isUnlocked } = storeToRefs(platformStore)

// --- Key prompt ---
const keyInput = ref('')
const { data: tenantsRes, isLoading, error } = platformQueries.useTenants(isUnlocked)
const isInvalidKey = computed(
  () => isAxiosError(error.value) && error.value.response?.status === 401
)
watch(isInvalidKey, (invalid) => invalid && platformStore.lock())

function unlock() {
  if (keyInput.value.trim()) platformStore.unlock(keyInput.value)
}

// --- Activate / deactivate ---
const updateTenant = platformQueries.useUpdateTenant()

async function setActive(tenant: PlatformTenant, isActive: boolean) {
  await updateTenant.mutateAsync({ uuid: tenant.uuid, isActive })
  toast.success(t(isActive ? 'platform.activated' : 'platform.deactivated', { name: tenant.name }))
}

// --- New company ---
const createTenant = platformQueries.useCreateTenant()
const isDialogOpen = ref(false)
const emptyForm = () => ({
  name: '',
  subdomain: '',
  contactEmail: '',
  contactPhone: '',
  companyWebsite: '',
  color: '',
  adminFullName: '',
  adminEmail: '',
  adminPassword: '',
})
const form = ref(emptyForm())

const appDomain = import.meta.env.VITE_APP_DOMAIN || window.location.host
const companyUrl = computed(
  () => `${window.location.protocol}//${form.value.subdomain || 'company'}.${appDomain}`
)

const resolver = computed(() =>
  zodResolver(
    z.object({
      name: rules.text(t('platform.companyName'), { min: 2, max: 100 }),
      subdomain: rules.subdomain(t('platform.subdomain')),
      contactEmail: rules.email(t('platform.contactEmail')),
      contactPhone: rules.optionalText(t('platform.contactPhone'), { max: 30 }),
      companyWebsite: rules.optionalUrl(),
      color: rules.hexColor(),
      adminFullName: rules.text(t('auth.fullName'), { min: 2, max: 100 }),
      adminEmail: rules.email(t('auth.email')),
      adminPassword: rules.password(t('auth.password')),
    })
  )
)

async function submitNewCompany(event: FormSubmitEvent) {
  if (!event.valid) return
  const values = event.values as ReturnType<typeof emptyForm>
  const payload: CreateTenantRequest = {
    name: values.name,
    subdomain: values.subdomain,
    contactEmail: values.contactEmail,
    contactPhone: values.contactPhone || null,
    companyWebsite: values.companyWebsite || null,
    color: values.color || null,
    admin: {
      fullName: values.adminFullName,
      email: values.adminEmail,
      password: values.adminPassword,
    },
  }
  try {
    const { data: tenant } = await createTenant.mutateAsync(payload)
    toast.success(t('platform.created', { name: tenant.name }))
    isDialogOpen.value = false
    form.value = emptyForm()
  } catch {
    // The API error toast explains what to fix (e.g. subdomain already taken)
  }
}

const fields = computed(() => ({
  company: [
    { name: 'name', label: t('platform.companyName') },
    { name: 'subdomain', label: t('platform.subdomain'), ltr: true },
    { name: 'contactEmail', label: t('platform.contactEmail'), ltr: true, type: 'email' },
    { name: 'contactPhone', label: t('platform.contactPhone'), ltr: true },
    { name: 'companyWebsite', label: t('platform.website'), ltr: true },
    { name: 'color', label: t('platform.color'), ltr: true, placeholder: '#0f766e' },
  ],
  admin: [
    { name: 'adminFullName', label: t('auth.fullName') },
    { name: 'adminEmail', label: t('auth.email'), ltr: true, type: 'email' },
  ],
}))
</script>

<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-950">
    <header class="flex items-center justify-between gap-4 border-b border-surface px-4 py-3">
      <span class="font-semibold">{{ t('common.appName') }} · {{ t('platform.keyTitle') }}</span>
      <div class="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeButton />
        <Button
          v-if="isUnlocked"
          :label="t('platform.lock')"
          size="small"
          variant="text"
          severity="secondary"
          @click="platformStore.lock()"
        />
      </div>
    </header>

    <!-- Key prompt -->
    <main v-if="!isUnlocked" class="flex justify-center px-4 py-16">
      <form class="flex w-full max-w-md flex-col gap-4" @submit.prevent="unlock">
        <h1 class="text-2xl font-semibold">{{ t('platform.keyTitle') }}</h1>
        <p class="text-muted-color">{{ t('platform.keyHint') }}</p>
        <label for="platform-key">{{ t('platform.key') }}</label>
        <Password
          v-model="keyInput"
          input-id="platform-key"
          :feedback="false"
          toggle-mask
          fluid
          autofocus
          dir="ltr"
          autocomplete="off"
        />
        <Message v-if="isInvalidKey" severity="error" size="small" variant="simple">
          {{ t('platform.invalidKey') }}
        </Message>
        <Button type="submit" :label="t('platform.unlock')" :disabled="!keyInput.trim()" />
      </form>
    </main>

    <!-- Companies -->
    <main v-else class="page-padding mx-auto max-w-6xl space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('platform.title') }}</h1>
          <p class="text-muted-color">{{ t('platform.subtitle') }}</p>
        </div>
        <Button :label="t('platform.newCompany')" @click="isDialogOpen = true">
          <template #icon><PlusIcon /></template>
        </Button>
      </div>

      <DataTable :value="tenantsRes?.data" :loading="isLoading" data-key="uuid" striped-rows>
        <template #empty>{{ t('platform.empty') }}</template>
        <Column field="name" :header="t('platform.companyName')" />
        <Column field="subdomain" :header="t('platform.subdomain')" />
        <Column field="contactEmail" :header="t('platform.contactEmail')" />
        <Column field="userCount" :header="t('platform.users')" />
        <Column field="createdAt" :header="t('common.createdAt')">
          <template #body="{ data }">{{ formatBackendDateForDisplay(data.createdAt) }}</template>
        </Column>
        <Column :header="t('common.active')">
          <template #body="{ data }">
            <ToggleSwitch
              :model-value="data.isActive"
              :aria-label="data.isActive ? t('common.active') : t('common.inactive')"
              :disabled="updateTenant.isPending.value"
              @update:model-value="setActive(data, $event)"
            />
          </template>
        </Column>
      </DataTable>
    </main>

    <Dialog
      v-model:visible="isDialogOpen"
      modal
      :header="t('platform.newCompany')"
      :style="{ width: '40rem' }"
      :breakpoints="{ '640px': '95vw' }"
    >
      <Form
        v-slot="$form"
        :initial-values="form"
        :resolver
        class="flex flex-col gap-6"
        @submit="submitNewCompany"
      >
        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-2 font-semibold">{{ t('platform.companyDetails') }}</legend>
          <div v-for="field in fields.company" :key="field.name" class="flex flex-col gap-2">
            <label :for="field.name">{{ field.label }}</label>
            <InputText
              :id="field.name"
              :name="field.name"
              :type="field.type ?? 'text'"
              :dir="field.ltr ? 'ltr' : undefined"
              :placeholder="field.placeholder"
              v-model="form[field.name as keyof typeof form]"
              fluid
            />
            <small v-if="field.name === 'subdomain'" class="text-muted-color" dir="ltr">
              {{ t('platform.subdomainHint', { url: companyUrl }) }}
            </small>
            <Message
              v-if="$form[field.name]?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form[field.name]?.error?.message }}
            </Message>
          </div>
        </fieldset>

        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-1 font-semibold">{{ t('platform.adminDetails') }}</legend>
          <p class="text-sm text-muted-color sm:col-span-2">{{ t('platform.adminHint') }}</p>
          <div v-for="field in fields.admin" :key="field.name" class="flex flex-col gap-2">
            <label :for="field.name">{{ field.label }}</label>
            <InputText
              :id="field.name"
              :name="field.name"
              :type="field.type ?? 'text'"
              :dir="field.ltr ? 'ltr' : undefined"
              v-model="form[field.name as keyof typeof form]"
              fluid
            />
            <Message
              v-if="$form[field.name]?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form[field.name]?.error?.message }}
            </Message>
          </div>
          <div class="flex flex-col gap-2">
            <label for="adminPassword">{{ t('auth.password') }}</label>
            <Password
              v-model="form.adminPassword"
              input-id="adminPassword"
              name="adminPassword"
              autocomplete="new-password"
              :feedback="false"
              toggle-mask
              fluid
            />
            <Message
              v-if="$form.adminPassword?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.adminPassword.error?.message }}
            </Message>
          </div>
        </fieldset>

        <div class="flex justify-end gap-2">
          <Button
            :label="t('common.cancel')"
            severity="secondary"
            variant="outlined"
            @click="isDialogOpen = false"
          />
          <Button
            type="submit"
            :label="t('platform.create')"
            :loading="createTenant.isPending.value"
          />
        </div>
      </Form>
    </Dialog>
  </div>
</template>
