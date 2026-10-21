<script setup>
defineProps({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  score: { type: Number, required: true },
  duration: { type: Number, required: true },
})
</script>

<template>
  <section class="results" aria-live="polite">
    <div>
      <div class="stat-label">palabras por minuto</div>
      <div class="stat-value">{{ wpm }}</div>
    </div>

    <div>
      <div class="stat-label">precisión</div>
      <div class="stat-value small">{{ accuracy }}<span class="unit">%</span></div>
    </div>

    <div>
      <div class="stat-label">puntaje</div>
      <div class="stat-value small">{{ score }}<span class="unit">pts</span></div>
    </div>

    <div>
      <div class="stat-label">tiempo</div>
      <div class="stat-value small">{{ duration }}<span class="unit">s</span></div>
    </div>
  </section>
</template>

<style scoped>
.results {
  display: flex;
  gap: 56px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.stat-label {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 6px;
}
.stat-value {
  font-family: var(--font-mono);
  font-size: 56px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
.stat-value.small {
  font-size: 32px;
  color: var(--text);
}
.unit {
  font-size: 20px;
  color: var(--text-dim);
  font-weight: 400px;
  margin-left: 4px;
}

@media (max-width: 480px) {
  .results {
    gap: var(--space-4);
  }
  .stat-value {
    font-size: 40px;
  }
  .stat-value.small {
    font-size: 28px;
  }
}
</style>
