<script setup lang="ts"></script>

<template>
  <div
    class="flex min-h-screen w-full items-center justify-center lg:grid lg:grid-cols-2 lg:items-stretch"
  >
    <div class="hidden bg-surface-500 lg:block">
      <img
        src="https://www.shadcn-vue.com/placeholder.svg"
        alt="Image"
        width="1920"
        height="1080"
        class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
    <main class="flex w-full items-center justify-center p-8 md:p-12">
      <router-view />
    </main>
  </div>
</template>
