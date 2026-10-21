<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import DurationPicker from '@/components/DurationPicker.vue'
import KeyIndicator from '@/components/KeyIndicator.vue'
import RestartButton from '@/components/RestartButton.vue'
import ResultsScreen from '@/components/ResultsScreen.vue'
import StatsBar from '@/components/StatsBar.vue'
import TypingArea from '@/components/TypingArea.vue'
import { userKeyIndicator } from '@/composables/useKeyIndicator'
import { useTypingTest } from '@/composables/useTypingTest'

const DURATIONS = [15, 30, 60, 120]

const test = useTypingTest()
const { text, chars, wordDone, currentIndex, status, timeLeft, duration, score, wpm, accuracy } =
  test

const keyIndicator = userKeyIndicator()
const { label: lastKey, active: lastKeyActive } = keyIndicator

const area = ref(null)

function onChar(char) {
  if (test.typeChar(char)) keyIndicator.press(char)
}

function onBackspace() {
  if (test.backspace()) keyIndicator.press('Backspace')
}

//esperamos el proximo render porque typingarea puede estar montandose de nuevo
async function focusArea() {
  await nextTick()
  area.value?.focus()
}

function restart() {
  test.reset()
  keyIndicator.clear()
  focusArea()
}

function changeDuration(seconds) {
  test.setDuration(seconds)
  keyIndicator.clear()
  focusArea()
}

// en la pantalla de resultados no hay nada enfocado, así que escuchamos toda la ventana.
// (a proposito no enfocamos el botón: una tecla pendiente podría reiniciar sin querer)
function onWindowKeydown(e) {
  if (status.value === 'finished' && (e.key === 'Tab' || e.key === 'Escape')) {
    e.preventDefault()
    restart()
  }
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
  <main class="home">
    <header class="topbar">
      <h1 class="logo">mate<span>clado</span></h1>
      <DurationPicker
        :options="DURATIONS"
        :value="duration"
        :disabled="status === 'running'"
        @select="changeDuration"
      />
    </header>

    <template v-if="status !== 'finished'">
      <div class="stat-row">
        <StatsBar :status="status" :time-left="timeLeft" :wpm="wpm" :score="score" />
        <KeyIndicator :label="lastKey" :active="lastKeyActive" />
      </div>

      <TypingArea
        ref="area"
        :text="text"
        :chars="chars"
        :word-done="wordDone"
        :current-index="currentIndex"
        @char="onChar"
        @backspace="onBackspace"
        @restart="restart"
      />
    </template>

    <ResultsScreen v-else :wpm="wpm" :accuracy="accuracy" :score="score" :duration="duration" />

    <div class="restart-row">
      <RestartButton :label="status === 'finished' ? 'probar de nuevo' : 'reiniciar'" />
    </div>

    <p class="footer-note">
      <template v-if="status === 'finished'"><kbd>tab</kbd> para arrancar de nuevo</template>
      <template v-else>
        <kbd>tab</kbd> o <kbd>esc</kbd> reinicia con un texto nuevo · <kbd>⌫</kbd> corrige lo que
        escribiste
      </template>
    </p>
  </main>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.logo {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--accent);
}

.logo span {
  color: var(--text-dim);
  font-weight: 400;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  margin-bottom: var(--space-3);
}

.restart-row {
  display: flex;
  justify-content: center;
  margin-top: var(--space-5);
}

.footer-note {
  margin: 64px 0 0;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  color: var(--text-faint);
}

.footer-note kbd {
  font-family: var(--font-mono);
  background: var(--surface);
  padding: 1px 6px;
  border-radius: 3px;
  color: var(--text-dim);
}

/* en celular no hay tecla Tab ni Esc*/
@media (pointer: coarse) {
  .footer-note {
    display: none;
  }
}
</style>
