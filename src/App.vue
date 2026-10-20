<script setup>
import { onMounted, ref } from 'vue'
import { useTypingTest } from './composables/useTypingTest'

const DURATIONS = [15, 30, 60, 120]

const test = useTypingTest()
const { text, chars, wordDone, currentIndex, status, timeLeft, duration, score, wpm, accuracy } =
  test

const zone = ref(null)
onMounted(() => zone.value?.focus())

function onKeydown(e) {
  if (e.key === 'Tab' || e.key === 'Escape') {
    e.preventDefault()
    test.reset()
    return
  }
  if (e.key === 'Backspace') {
    e.preventDefault()
    test.backspace()
    return
  }
  // dejamos pasar atajos como Ctrl+R (altgr cuenta como Ctrl+Alt, asi que si se tipea)
  if (e.metaKey || (e.ctrlKey && !e.altKey)) return
  if (e.key.length === 1) {
    e.preventDefault()
    test.typeChar(e.key)
  }
}

function charClass(i) {
  if (i === currentIndex.value && status.value !== 'finished') return 'ch current'
  return wordDone.value[i] ? 'ch word-done' : `ch ${chars.value[i]}`
}

function changeDuration(d) {
  test.setDuration(d)
  zone.value?.focus()
}
</script>

<template>
  <h1 class="title">mate<span>clado</span></h1>

  <div class="modes">
    <button
      v-for="d in DURATIONS"
      :key="d"
      :class="{ active: duration === d }"
      :disabled="status === 'running'"
      @click="changeDuration(d)"
    >
    {{ d }}s
    </button>
  </div>

  <p class="stats">
    {{ status }} · {{ timeLeft }}s · {{ wpm }} ppm · {{ accuracy }}% · {{ score }} pts
  </p>

  <div ref="zone" class="zone" tabindex="0" @keydown="onKeydown">
    <span v-for="(c, i) in text" :key="i" :class="charClass(i)">{{ c }}</span>
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

.modes {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.modes button {
  background: var(--surface);
  border: 1px solid var(--surface-2);
  color: var(--text-dim);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  cursor: pointer;
}

.modes button.active {
  color: var(--accent);
}

.modes button:disabled {
  opacity: 0.5;
  cursor: default;
}

.stats {
  font-family: var(--font-mono);
  color: var(--accent);
  font-size: 14px;
}

.zone {
  width: 100%;
  max-width: var(--content-width);
  font-family: var(--font-mono);
  font-size: 22px;
  line-height: 1.7;
  outline: none;
  user-select: none;
}

.ch {
  white-space: pre-wrap;
}

.pending {
  color: var(--text-faint);
}

.correct {
  color: var(--text);
}

.incorrect {
  color: var(--error);
  background: var(--error-dim);
  border-radius: 2px;
}

.word-done {
  color: var(--success);
}

.current {
  color: var(--text);
  background: var(--accent-soft);
  border-radius: 2px;
}
</style>
