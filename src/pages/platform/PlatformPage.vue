<script setup lang="ts">
import { isAxiosError } from 'axios'
import { storeToRefs } from 'pinia'
import { useConfirm } from 'primevue/useconfirm'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { platformQueries } from '@/api/services/platform-services'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeButton from '@/components/ThemeButton.vue'
import ColorInput from '@/components/form/ColorInput.vue'
import FormDialog from '@/components/form/FormDialog.vue'
import FormField from '@/components/form/FormField.vue'
import TeamManager from '@/components/team/TeamManager.vue'
import { useEditForm } from '@/composables/use-edit-form'
import { useFormRules } from '@/composables/use-form-rules'
import { markFirstField } from '@/lib/dialog'
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

// --- Edit company ---
const isEditOpen = ref(false)
const editingTenant = ref<PlatformTenant>()
const editForm = useEditForm(
  () => ({
    name: '',
    contactEmail: '',
    contactPhone: '',
    companyWebsite: '',
    address: '',
    color: '',
    tagline: '',
    description: '',
    isActive: true,
  }),
  () =>
    z.object({
      name: rules.text(t('platform.companyName'), { min: 2, max: 100 }),
      contactEmail: rules.email(t('platform.contactEmail')),
      contactPhone: rules.optionalText(t('platform.contactPhone'), { max: 30 }),
      companyWebsite: rules.optionalUrl(),
      address: rules.optionalText(t('platform.address'), { max: 255 }),
      color: rules.hexColor(),
      tagline: rules.optionalText(t('platform.tagline'), { max: 120 }),
      description: rules.optionalText(t('platform.description'), { max: 1000 }),
    })
)

function openEdit(tenant: PlatformTenant) {
  editingTenant.value = tenant
  editForm.reset({
    name: tenant.name,
    contactEmail: tenant.contactEmail ?? '',
    contactPhone: tenant.contactPhone ?? '',
    companyWebsite: tenant.companyWebsite ?? '',
    address: tenant.address ?? '',
    color: tenant.color ?? '',
    tagline: tenant.tagline ?? '',
    description: tenant.description ?? '',
    isActive: tenant.isActive,
  })
  isEditOpen.value = true
}

async function saveEdit() {
  if (!editForm.validate() || !editingTenant.value) return
  const values = editForm.values.value
  const orNull = (value: string) => value.trim() || null
  try {
    await updateTenant.mutateAsync({
      uuid: editingTenant.value.uuid,
      name: values.name.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhone: orNull(values.contactPhone),
      companyWebsite: orNull(values.companyWebsite),
      address: orNull(values.address),
      color: orNull(values.color),
      tagline: orNull(values.tagline),
      description: orNull(values.description),
      isActive: values.isActive,
    })
    toast.success(t('platform.saved', { name: values.name.trim() }))
    isEditOpen.value = false
  } catch (error) {
    editForm.showServerErrors(error)
  }
}

// --- Users of a company ---
const usersOf = ref<PlatformTenant>()
const isUsersOpen = computed({
  get: () => !!usersOf.value,
  set: (open) => !open && (usersOf.value = undefined),
})

// --- Demo companies: reset sample data ---
const confirm = useConfirm()
const resetSampleData = platformQueries.useResetSampleData()
const resetting = ref<PlatformTenant['uuid']>()
function confirmReset(tenant: PlatformTenant) {
  confirm.require({
    header: t('platform.resetTitle'),
    message: t('platform.resetMessage', { name: tenant.name }),
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('platform.resetSampleData'), severity: 'danger' },
    defaultFocus: 'reject',
    accept: async () => {
      resetting.value = tenant.uuid
      try {
        await resetSampleData.mutateAsync(tenant.uuid)
        toast.success(t('platform.resetDone', { name: tenant.name }))
      } finally {
        resetting.value = undefined
      }
    },
  })
}

// --- Delete a deactivated company: its subdomain is typed as confirmation ---
const deleteTenant = platformQueries.useDeleteTenant()
const deleting = ref<PlatformTenant>()
const isDeleteOpen = computed({
  get: () => !!deleting.value,
  set: (open) => !open && (deleting.value = undefined),
})
const deleteForm = useEditForm(
  () => ({ subdomain: '' }),
  () =>
    z.object({
      subdomain: z.literal(deleting.value?.subdomain ?? '', {
        error: t('platform.deleteMismatch'),
      }),
    })
)
function openDelete(tenant: PlatformTenant) {
  deleting.value = tenant
  deleteForm.reset()
}
async function confirmDelete() {
  const tenant = deleting.value
  if (!tenant || !deleteForm.validate()) return
  try {
    await deleteTenant.mutateAsync({ uuid: tenant.uuid, subdomain: tenant.subdomain })
    toast.success(t('platform.deleted', { name: tenant.name }))
    deleting.value = undefined
  } catch (error) {
    deleteForm.showServerErrors(error)
  }
}

// --- New company ---
const createTenant = platformQueries.useCreateTenant()
const isDialogOpen = ref(false)
const createFormRef = useTemplateRef<{ $el: Element }>('createForm')
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
  withSampleData: false,
})
const form = ref(emptyForm())
type TextField = Exclude<keyof ReturnType<typeof emptyForm>, 'withSampleData'>

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
    // The checkbox isn't in the validation schema, so it's read from the model
    withSampleData: form.value.withSampleData,
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
    { name: 'color', label: t('platform.color') },
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
        <Column field="name" :header="t('platform.companyName')">
          <template #body="{ data }">
            <span class="flex items-center gap-2">
              {{ data.name }}
              <Tag v-if="data.isDemo" :value="t('platform.demo')" severity="warn" />
            </span>
          </template>
        </Column>
        <Column
          field="subdomain"
          :header="t('platform.subdomain')"
          body-class="whitespace-nowrap"
        />
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
        <Column>
          <template #body="{ data }">
            <div class="flex justify-end gap-1">
              <Button
                :label="t('platform.users')"
                size="small"
                variant="text"
                severity="secondary"
                @click="usersOf = data"
              >
                <template #icon><UsersIcon /></template>
              </Button>
              <Button
                :aria-label="`${t('platform.edit')} ${data.name}`"
                size="small"
                variant="text"
                severity="secondary"
                @click="openEdit(data)"
              >
                <template #icon><PencilIcon /></template>
              </Button>
              <Button
                v-if="data.isDemo"
                :aria-label="`${t('platform.resetSampleData')} ${data.name}`"
                size="small"
                variant="text"
                severity="secondary"
                :loading="resetSampleData.isPending.value && resetting === data.uuid"
                @click="confirmReset(data)"
              >
                <template #icon><ArrowPathIcon /></template>
              </Button>
              <!-- Only once deactivated, so a company in use can't be deleted by one misclick -->
              <Button
                v-if="!data.isActive"
                :aria-label="`${t('platform.delete')} ${data.name}`"
                size="small"
                variant="text"
                severity="secondary"
                class="hover:text-red-600!"
                @click="openDelete(data)"
              >
                <template #icon><TrashIcon /></template>
              </Button>
            </div>
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
      @show="markFirstField(createFormRef?.$el)"
    >
      <Form
        ref="createForm"
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
            <ColorInput
              v-if="field.name === 'color'"
              :id="field.name"
              v-model="form.color"
              :name="field.name"
              :invalid="$form.color?.invalid"
            />
            <InputText
              v-else
              :id="field.name"
              :name="field.name"
              :type="field.type ?? 'text'"
              :dir="field.ltr ? 'ltr' : undefined"
              v-model="form[field.name as TextField]"
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
              v-model="form[field.name as TextField]"
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

        <label
          class="flex items-start gap-3 rounded-lg border border-surface-200 p-3 dark:border-surface-700"
        >
          <Checkbox
            v-model="form.withSampleData"
            binary
            input-id="with-sample-data"
            class="mt-0.5"
          />
          <span class="flex flex-col">
            <span class="font-medium">{{ t('platform.withSampleData') }}</span>
            <span class="text-sm font-normal text-muted-color">
              {{ t('platform.withSampleDataHint') }}
            </span>
          </span>
        </label>

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

    <FormDialog
      v-model:visible="isEditOpen"
      :title="t('platform.edit')"
      :saving="updateTenant.isPending.value"
      @submit="saveEdit"
    >
      <FormField
        :label="t('platform.companyName')"
        for="edit-name"
        :server-error="editForm.errors.value.name"
      >
        <InputText id="edit-name" v-model="editForm.values.value.name" fluid />
      </FormField>
      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          :label="t('platform.contactEmail')"
          for="edit-email"
          :server-error="editForm.errors.value.contactEmail"
        >
          <InputText
            id="edit-email"
            v-model="editForm.values.value.contactEmail"
            type="email"
            dir="ltr"
            fluid
          />
        </FormField>
        <FormField
          :label="t('platform.contactPhone')"
          for="edit-phone"
          optional
          :server-error="editForm.errors.value.contactPhone"
        >
          <InputText id="edit-phone" v-model="editForm.values.value.contactPhone" dir="ltr" fluid />
        </FormField>
        <FormField
          :label="t('platform.website')"
          for="edit-website"
          optional
          :server-error="editForm.errors.value.companyWebsite"
        >
          <InputText
            id="edit-website"
            v-model="editForm.values.value.companyWebsite"
            dir="ltr"
            fluid
          />
        </FormField>
        <FormField
          :label="t('platform.color')"
          for="edit-color"
          optional
          :server-error="editForm.errors.value.color"
        >
          <ColorInput
            id="edit-color"
            v-model="editForm.values.value.color"
            :invalid="!!editForm.errors.value.color"
          />
        </FormField>
      </div>
      <FormField
        :label="t('platform.address')"
        for="edit-address"
        optional
        :server-error="editForm.errors.value.address"
      >
        <InputText id="edit-address" v-model="editForm.values.value.address" fluid />
      </FormField>
      <FormField
        :label="t('platform.tagline')"
        for="edit-tagline"
        optional
        :hint="t('platform.taglineHint')"
        :server-error="editForm.errors.value.tagline"
      >
        <InputText id="edit-tagline" v-model="editForm.values.value.tagline" fluid />
      </FormField>
      <FormField
        :label="t('platform.description')"
        for="edit-description"
        optional
        :server-error="editForm.errors.value.description"
      >
        <Textarea
          id="edit-description"
          v-model="editForm.values.value.description"
          rows="3"
          auto-resize
          fluid
        />
      </FormField>
      <label class="flex items-center gap-3">
        <ToggleSwitch v-model="editForm.values.value.isActive" />
        {{ t('platform.active') }}
      </label>
    </FormDialog>

    <FormDialog
      v-model:visible="isDeleteOpen"
      :title="t('platform.deleteTitle', { name: deleting?.name })"
      :submit-label="t('platform.delete')"
      :saving="deleteTenant.isPending.value"
      danger
      @submit="confirmDelete"
    >
      <p>{{ t('platform.deleteWarning', { name: deleting?.name }) }}</p>
      <FormField
        :label="t('platform.deleteConfirm', { subdomain: deleting?.subdomain })"
        for="delete-subdomain"
        :server-error="deleteForm.errors.value.subdomain"
      >
        <InputText
          id="delete-subdomain"
          v-model="deleteForm.values.value.subdomain"
          dir="ltr"
          autocomplete="off"
          :invalid="!!deleteForm.errors.value.subdomain"
          fluid
        />
      </FormField>
    </FormDialog>

    <Drawer
      v-model:visible="isUsersOpen"
      :header="usersOf ? t('platform.usersOf', { name: usersOf.name }) : ''"
      position="right"
      :pt:root:class="'w-full! sm:w-[40rem]!'"
    >
      <TeamManager
        v-if="usersOf"
        :key="usersOf.uuid"
        :scope="{ kind: 'platform', tenantUuid: usersOf.uuid }"
      />
    </Drawer>
  </div>
</template>
