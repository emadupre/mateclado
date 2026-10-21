<script setup>
defineProps({
  options: { type: Array, required: true },
  value: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<template>
  <div class="modes" role="group" aria-label="Duración del test">
    <button
      v-for="d in options"
      :key="d"
      type="button"
      :class="{ active: value === d }"
      :aria-pressed="value === d"
      :disabled="disabled"
      @click="$emit('select', d)"
    >
      {{ d }}s
    </button>
  </div>
</template>

<style scoped>
.modes {
  display: flex;
  gap: var(--space-1);
  background: var(--surface);
  padding: var(--space-1);
  border-radius: var(--radius-md);
}
.modes button {
  min-height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
}
.modes button:hover {
  color: var(--text);
}
.modes button.active {
  background: var(--surface-2);
  color: var(--accent);
}
.modes button:disabled {
  opacity: 0.5;
  cursor: default;
}

/* para pantallas tactiles, area de toque más grandes. */
@media (pointer: coarse) {
  .modes button {
    min-height: 44px;
    padding: 0 14px;
  }
}
</style>
