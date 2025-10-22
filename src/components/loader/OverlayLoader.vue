<script setup lang="ts">
const { loading } = defineProps<{ loading: boolean }>()
</script>

<template>
  <Dialog :visible="loading" modal unstyled pt:mask:class="backdrop-blur-[2px]">
    <template #container><ProgressSpinner /></template>
  </Dialog>
</template>
