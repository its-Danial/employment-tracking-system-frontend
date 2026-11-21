<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useFormRules } from '@/composables/use-form-rules'
import { useTenantStore } from '@/stores/tenant'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'

const { t } = useI18n()
const router = useRouter()
const rules = useFormRules()

const userStore = useUserStore()
const { tenant } = storeToRefs(useTenantStore())

const resolver = computed(() =>
  zodResolver(
    z.object({
      fullName: rules.text(t('auth.fullName'), { min: 2, max: 100 }),
      email: rules.email(t('auth.email')),
      password: rules.password(t('auth.password')),
    })
  )
)

const credentials = ref({ fullName: '', email: '', password: '' })
const loading = ref(false)

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return
  try {
    loading.value = true
    await userStore.register(event.values as typeof credentials.value)
    await router.push({ name: RouteName.Dashboard })
  } catch {
    // The API error toast already explains what went wrong
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-8">
    <header class="flex flex-col items-center gap-4">
      <img
        v-if="tenant?.logoUrl"
        :src="tenant?.logoUrl"
        :alt="tenant?.name"
        class="mx-auto block max-w-3xs lg:hidden"
      />
      <div class="flex w-full flex-col items-center gap-2 **:w-full **:text-center">
        <div class="text-2xl leading-tight font-semibold text-color-emphasis">
          {{ t('auth.createAccount') }}
        </div>
        <div class="space-x-1 rtl:space-x-reverse">
          <span class="leading-normal text-muted-color">{{ t('auth.haveAccount') }}</span>
          <router-link
            :to="{ name: RouteName.Login }"
            class="cursor-pointer font-medium text-primary hover:text-primary-emphasis"
          >
            {{ t('auth.logIn') }}
          </router-link>
        </div>
      </div>
    </header>

    <Form
      v-slot="$form"
      :initial-values="credentials"
      :resolver
      @submit="handleSubmit"
      class="flex flex-col gap-6"
    >
      <div class="flex w-full flex-col gap-2">
        <label for="fullName">{{ t('auth.fullName') }}</label>
        <InputText
          id="fullName"
          name="fullName"
          autocomplete="name"
          v-model="credentials.fullName"
          fluid
          :placeholder="t('auth.fullName')"
          class="shadow-sm"
        />
        <Message v-if="$form.fullName?.invalid" severity="error" size="small" variant="simple">
          {{ $form.fullName.error?.message }}
        </Message>
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="email">{{ t('auth.email') }}</label>
        <InputText
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          dir="ltr"
          v-model="credentials.email"
          fluid
          :placeholder="t('auth.email')"
          class="shadow-sm"
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error?.message }}
        </Message>
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="password">{{ t('auth.password') }}</label>
        <Password
          input-id="password"
          name="password"
          autocomplete="new-password"
          v-model="credentials.password"
          toggleMask
          fluid
          :placeholder="t('auth.password')"
          input-class="shadow-sm"
        >
          <template #unmaskicon="{ toggleCallback }">
            <EyeIcon class="p-password-toggle-mask-icon cursor-pointer" @click="toggleCallback" />
          </template>
          <template #maskicon="{ toggleCallback }">
            <EyeSlashIcon
              class="p-password-toggle-mask-icon cursor-pointer"
              @click="toggleCallback"
            />
          </template>
        </Password>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password.error?.message }}
        </Message>
      </div>
      <Button :label="t('auth.signUp')" type="submit" fluid :loading>
        <template #icon>
          <UserIcon />
        </template>
      </Button>
    </Form>
  </div>
</template>
