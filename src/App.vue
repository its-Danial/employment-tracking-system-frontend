<script setup lang="ts">
import { storeToRefs } from 'pinia'
import OverlayLoader from '@/components/loader/OverlayLoader.vue'
import { useLoadingStore } from '@/stores/loading'

const { loading } = storeToRefs(useLoadingStore())
</script>

<template>
  <Toast />
  <OverlayLoader :loading />
  <router-view />
</template>
