<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <RouterView />
  </div>
</template>

<style scoped>
.shell {
  width: 100%;
  max-width: var(--content-width);
}
</style>
