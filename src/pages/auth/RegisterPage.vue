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
    fullName: z
      .string()
      .min(2, {
        error: (issue) => (!issue.input ? 'Full Name is required' : 'Full Name is too short'),
      })
      .max(100),
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
  fullName: '',
  email: '',
  password: '',
})

const loading = ref(false)

async function handleSubmit(event: FormSubmitEvent) {
  try {
    if (event.valid) {
      loading.value = true
      await userStore.register(event.values as typeof credentials.value)
      await router.push({ name: RouteName.Dashboard })
    } else {
      // Handle invalid form submission
      console.log('Form submission errors:', event.errors)
    }
  } catch (error) {
    console.error('Registration failed:', error)
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
        <div class="text-2xl leading-tight font-semibold text-color-emphasis">
          Register an Account
        </div>
        <div class="space-x-1">
          <span class="leading-normal text-muted-color">Already have an account?</span>
          <router-link
            :to="{ name: RouteName.Login }"
            class="cursor-pointer font-medium text-primary hover:text-primary-emphasis"
          >
            Login!
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
        <label for="fullName">Full Name</label>
        <InputText
          id="fullName"
          name="fullName"
          type="text"
          v-model="credentials.fullName"
          fluid
          placeholder="Full Name"
          class="shadow-sm"
        />
        <Message v-if="$form.fullName?.invalid" severity="error" size="small" variant="simple">
          {{ $form.fullName.error?.message }}
        </Message>
      </div>
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
      <Button label="Sign In" type="submit" fluid :loading>
        <template #icon>
          <UserIcon />
        </template>
      </Button>
    </Form>
  </div>
</template>
