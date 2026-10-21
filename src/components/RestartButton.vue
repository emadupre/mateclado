<script setup>
defineProps({
  label: { type: String, default: 'reiniciar' },
})
</script>

<template>
  <button type="button" class="restart-btn" :title="label" :aria-label="label">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  </button>
</template>

<style scoped>
.restart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-faint);
  cursor: pointer;
}
.restart-btn:hover {
  color: var(--accent);
  background: var(--surface);
}
.restart-btn svg {
  width: 18px;
  height: 18px;
}
</style>
