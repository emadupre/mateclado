<script setup>
const swatches = [
  'bg',
  'surface',
  'surface-2',
  'text',
  'text-dim',
  'text-faint',
  'accent',
  'success',
  'error',
]
</script>

<template>
  <h1 class="title">mate<span>clado</span></h1>
  <div class="palette">
    <div v-for="s in swatches" :key="s" class="swatch">
      <div class="chip" :style="{ background: `var(--${s})` }"></div>
      <code>{{ s }}</code>
    </div>
  </div>
</template>

<style scoped>
.title {
  font-family: var(--font-mono);
  color: var(--accent);
  font-size: 28px;
}
.title span {
  color: var(--text-dim);
  font-weight: 400;
}
.palette {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  max-width: var(--content-width);
}
.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}
.chip {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-2);
}
</style>
