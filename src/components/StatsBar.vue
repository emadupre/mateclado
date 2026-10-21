<script setup>
defineProps({
  status: { type: String, required: true },
  timeLeft: { type: Number, required: true },
  wpm: { type: Number, required: true },
  score: { type: Number, required: true },
})
</script>

<template>
  <div class="live-stats">
    <template v-if="status === 'running'">
      {{ timeLeft }}s · {{ wpm }} ppm · {{ score }} pts
    </template>
  </div>
</template>

<style scoped>
.live-stats {
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--accent);
}
</style>
