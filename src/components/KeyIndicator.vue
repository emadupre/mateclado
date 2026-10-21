<script setup>
defineProps({
  label: { type: String, default: '' },
  active: { type: Boolean, default: false },
})
</script>

<template>
  <div class="keycap" :class="{ active }" aria-hidden="true">{{ label || '·' }}</div>
</template>

<style scoped>
.keycap {
  min-width: 26px;
  padding: 3px 9px;
  border-radius: 5px;
  border: 1px solid var(--surface-2);
  background: var(--surface);
  color: var(--text-faint);
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  opacity: 0.5;
  transition:
    opacity 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
  user-select: none;
}
.keycap.active {
  opacity: 1;
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}
</style>
