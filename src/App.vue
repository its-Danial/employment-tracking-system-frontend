<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Toast from 'primevue/toast'
import OverlayLoader from '@/components/loader/OverlayLoader.vue'
import { useLoadingStore } from '@/stores/loading'
import { usePresetStore } from '@/stores/preset'
import { useToastStore } from '@/stores/toast'

useToastStore()
usePresetStore() // Initialize color mode
const { loading } = storeToRefs(useLoadingStore())
</script>

<template>
  <Toast />
  <OverlayLoader :loading />
  <router-view />
</template>
