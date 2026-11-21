<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useFormRules } from '@/composables/use-form-rules'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'

const { t } = useI18n()
const router = useRouter()
const rules = useFormRules()

const userStore = useUserStore()

const resolver = computed(() =>
  zodResolver(
    z.object({
      email: rules.email(t('auth.email')),
      password: rules.password(t('auth.password')),
    })
  )
)

const credentials = ref({ email: '', password: '', rememberMe: false })
const loading = ref(false)

async function handleSubmit(event: FormSubmitEvent) {
  if (!event.valid) return
  try {
    loading.value = true
    // The checkbox isn't part of the validation schema, so it's read from the model directly
    await userStore.login({
      ...(event.values as typeof credentials.value),
      rememberMe: credentials.value.rememberMe,
    })
    await router.push({ name: RouteName.Dashboard })
  } catch {
    // The API error toast already explains what went wrong
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-10">
    <header class="flex flex-col gap-2">
      <h2 class="text-3xl leading-tight font-semibold tracking-tight text-color-emphasis">
        {{ t('auth.welcomeBack') }}
      </h2>
      <p class="text-muted-color">{{ t('auth.logInHint') }}</p>
    </header>

    <Form
      v-slot="$form"
      :initial-values="credentials"
      :resolver
      @submit="handleSubmit"
      class="flex flex-col gap-5"
    >
      <div class="flex w-full flex-col gap-1.5">
        <label for="email">{{ t('auth.email') }}</label>
        <InputText
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          dir="ltr"
          v-model="credentials.email"
          fluid
          placeholder="name@company.com"
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error?.message }}
        </Message>
      </div>
      <div class="flex w-full flex-col gap-1.5">
        <label for="password">{{ t('auth.password') }}</label>
        <Password
          input-id="password"
          name="password"
          autocomplete="current-password"
          v-model="credentials.password"
          toggleMask
          fluid
          :feedback="false"
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
      <div class="flex items-center gap-2">
        <Checkbox
          v-model="credentials.rememberMe"
          input-id="remember-me"
          name="rememberMe"
          binary
        />
        <label for="remember-me" class="font-normal text-muted-color">
          {{ t('auth.rememberMe') }}
        </label>
      </div>
      <Button :label="t('auth.logIn')" type="submit" fluid :loading class="mt-1" />
    </Form>

    <p class="text-sm text-muted-color">
      {{ t('auth.noAccount') }}
      <router-link
        :to="{ name: RouteName.Register }"
        class="font-medium text-primary underline-offset-4 hover:underline"
      >
        {{ t('auth.createOne') }}
      </router-link>
    </p>
  </div>
</template>
