<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DurationPicker from '@/components/DurationPicker.vue'
import KeyIndicator from '@/components/KeyIndicator.vue'
import RestartButton from '@/components/RestartButton.vue'
import ResultsScreen from '@/components/ResultsScreen.vue'
import ScoreSubmit from '@/components/ScoreSubmit.vue'
import StatsBar from '@/components/StatsBar.vue'
import TypingArea from '@/components/TypingArea.vue'
import { useKeyIndicator } from '@/composables/useKeyIndicator'
import { useScoreSubmission } from '@/composables/useScoreSubmission'
import { useTypingTest } from '@/composables/useTypingTest'
import { DEFAULT_DURATION, DURATIONS } from '@/data/durations'
import { useProfileStore } from '@/stores/profile'
import { normalizeNickname } from '@/utils/nickname'
import LearnedWords from '@/components/LearnedWords.vue'
import { GLOSARIO } from '@/data/glosario'
import { findWords, publishableEntries } from '@/utils/glosario'
import { FRASES } from '@/data/frases'
import { useCommunityStore } from '@/stores/community'
import { buildText } from '@/utils/buildText'

const community = useCommunityStore()
community.ensureLoaded()
const test = useTypingTest({
  initialDuration: DEFAULT_DURATION,
  textSource: (minChars) => buildText(minChars, { phrases: [...FRASES, ...community.phrases] }),
})

const { text, chars, wordDone, currentIndex, status, timeLeft, duration, score, wpm, accuracy } =
  test

watch(
  () => community.phrases.length,
  () => {
    if (status.value === 'waiting') test.reset()
  },
)

const playable = publishableEntries(GLOSARIO)
const learned = computed(() =>
  status.value === 'finished'
    ? findWords(text.value, currentIndex.value, [...playable, ...community.entries])
    : [],
)
const keyIndicator = useKeyIndicator()
const { label: lastKey, active: lastKeyActive } = keyIndicator

const profile = useProfileStore()
const nickname = ref(profile.nickname)
const submission = useScoreSubmission()
const { status: saveStatus, error: saveError } = submission

// si el jugador corrige el apodo después de un error, sacamos el mensaje
watch(nickname, () => submission.clearError())

const area = ref(null)

function onChar(char) {
  if (test.typeChar(char)) keyIndicator.press(char)
}

function onBackspace() {
  if (test.backspace()) keyIndicator.press('Backspace')
}

// esperamos al próximo render porque TypingArea puede estar montándose de nuevo
async function focusArea() {
  await nextTick()
  area.value?.focus()
}

function restart() {
  test.reset()
  keyIndicator.clear()
  submission.reset()
  focusArea()
}

function changeDuration(seconds) {
  test.setDuration(seconds)
  keyIndicator.clear()
  submission.reset()
  focusArea()
}

async function saveResult() {
  const saved = await submission.submit({
    nickname: nickname.value,
    wpm: wpm.value,
    accuracy: accuracy.value,
    score: score.value,
    duration: duration.value,
  })
  if (saved) profile.setNickName(normalizeNickname(nickname.value))
}

function isInsideFieldOrDialog(target) {
  return target instanceof HTMLElement && target.closest('input, textarea, select, dialog') !== null
}

// en la pantalla de resultados no hay nada enfocado, así que escuchamos en toda la ventana.
// Tab no se toca (hace falta para navegar el formulario) y Esc se ignora dentro de un campo.
function onWindowKeydown(e) {
  if (status.value !== 'finished' || e.key !== 'Escape') return
  if (isInsideFieldOrDialog(e.target)) return
  e.preventDefault()
  restart()
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
  <main class="home">
    <h1 class="sr-only">mateclado, test de velocidad de tipeo en español argentino</h1>

    <AppHeader>
      <DurationPicker
        :options="DURATIONS"
        :value="duration"
        :disabled="status === 'running'"
        @select="changeDuration"
      />
    </AppHeader>

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

    <template v-else>
      <ResultsScreen :wpm="wpm" :accuracy="accuracy" :score="score" :duration="duration" />
      <LearnedWords v-if="learned.length" :entries="learned" />
      <ScoreSubmit
        v-if="wpm > 0"
        v-model="nickname"
        :status="saveStatus"
        :error="saveError"
        :duration="duration"
        @submit="saveResult"
      />
    </template>

    <div class="restart-row">
      <RestartButton
        :label="status === 'finished' ? 'probar de nuevo' : 'reiniciar'"
        @click="restart"
      />
    </div>

    <p class="footer-note">
      <template v-if="status === 'finished'"><kbd>esc</kbd> para arrancar de nuevo</template>
      <template v-else>
        <kbd>tab</kbd> o <kbd>esc</kbd> reinicia con un texto nuevo · <kbd>⌫</kbd> corrige lo que
        escribiste
      </template>
    </p>
  </main>
</template>

<style scoped>
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

/* en celular no hay tecla Tab ni Esc */
@media (pointer: coarse) {
  .footer-note {
    display: none;
  }
}
</style>
