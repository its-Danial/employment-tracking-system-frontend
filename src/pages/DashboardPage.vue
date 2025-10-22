<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const useStore = useUserStore()
</script>

<template>
  <div class="p-6">
    <h1 class="mb-6 text-2xl font-bold">Dashboard</h1>
    <Button label="Logout" @click="useStore.logout()" />
  </div>
</template>
