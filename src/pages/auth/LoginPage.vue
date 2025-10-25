<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { useTenantStore } from '@/stores/tenant'
import { useUserStore } from '@/stores/user'
import { RouteName } from '@/types/router'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'

const router = useRouter()

const userStore = useUserStore()
const { tenant } = storeToRefs(useTenantStore())

const credentialResolver = zodResolver(
  z.object({
    email: z
      .email({ error: (issue) => (!issue.input ? 'Email is required' : 'Invalid email address') })
      .min(2)
      .max(100),
    password: z
      .string()
      .min(8, {
        error: (issue) => (!issue.input ? 'Password is required' : 'Password is too short'),
      })
      .max(100),
  })
)

const credentials = ref({
  email: '',
  password: '',
})

const loading = ref(false)

async function handleSubmit(event: FormSubmitEvent) {
  try {
    if (event.valid) {
      loading.value = true
      await userStore.login(event.values as typeof credentials.value)
      await router.push({ name: RouteName.Dashboard })
    } else {
      // Handle invalid form submission
      console.log('Form submission errors:', event.errors)
    }
  } catch (error) {
    console.error('Login failed:', error)
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
        class="mx-auto block max-w-3xs lg:hidden"
      />
      <div class="flex w-full flex-col items-center gap-2 **:w-full **:text-center">
        <div class="text-2xl leading-tight font-semibold text-color-emphasis">Welcome Back</div>
        <div class="space-x-1">
          <span class="leading-normal text-muted-color">Don't have an account?</span>
          <router-link
            :to="{ name: RouteName.Register }"
            class="font-medium text-primary hover:text-primary-emphasis"
          >
            Create today!
          </router-link>
        </div>
      </div>
    </header>

    <Form
      v-slot="$form"
      :initial-values="credentials"
      :resolver="credentialResolver"
      @submit="handleSubmit"
      class="flex flex-col gap-6"
    >
      <div class="flex w-full flex-col gap-2">
        <label for="email">Email Address</label>
        <InputText
          id="email"
          name="email"
          type="email"
          v-model="credentials.email"
          fluid
          placeholder="Email address"
          class="shadow-sm"
        />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error?.message }}
        </Message>
      </div>
      <div class="flex w-full flex-col gap-2">
        <label for="password">Password</label>
        <Password
          id="password"
          name="password"
          type="password"
          v-model="credentials.password"
          toggleMask
          fluid
          :feedback="false"
          placeholder="Password"
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
      <div class="flex justify-end">
        <router-link
          :to="{ name: RouteName.Login }"
          class="font-medium text-primary hover:text-primary-emphasis"
        >
          Forgot your password?
        </router-link>
      </div>
      <Button label="Login" type="submit" fluid :loading>
        <template #icon>
          <UserIcon />
        </template>
      </Button>
    </Form>
  </div>
</template>
