import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import { buildText } from '@/utils/buildText'
import { calcAccuracy, calcWpm, PENALTY_PER_ERROR, POINTS_PER_WORD } from '@/utils/stats'

const BUFFER_MARGIN = 60 // esto nos ayuda, cuando quedan menos de estos caract. agregamos más texto
const EXTRA_CHARS = 300

function minCharsFor(duration) {
  return Math.max(220, duration * 14)
}

export function useTypingTest({ initialDuration = 30, textSource = buildText } = {}) {
  const duration = ref(initialDuration)
  const status = ref('waiting') // 'waiting | 'running' | 'finished'
  const timeLeft = ref(initialDuration)
  const text = ref('')
  const chars = ref([]) // por cada caracter: 'pending' | 'correct' | 'incorrect'
  const wordDone = ref([]) // este true si el carácter pertenece a una palabra sellada.
  const currentIndex = ref(0)
  const lockedUpTo = ref(0) // hasta acá no se puede retroceder con backspace
  const score = ref(0)
  const wordsCompleted = ref(0)

  let timerId = null

  // -- derivados--
  const correctCount = computed(() => chars.value.filter((c) => c === 'correct').length)
  const incorrectCount = computed(() => chars.value.filter((c) => c === 'incorrect').length)
  const wpm = computed(() => calcWpm(correctCount.value, duration.value - timeLeft.value))
  const accuracy = computed(() =>
    calcAccuracy(correctCount.value, correctCount.value + incorrectCount.value),
  )

  // -- timer --
  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function finish() {
    stopTimer()
    timeLeft.value = 0
    status.value = 'finished'
  }

  function startTimer() {
    status.value = 'running'
    timerId = setInterval(() => {
      timeLeft.value -= 1
      if (timeLeft.value <= 0) finish()
    }, 1000)
  }

  // -- texto --
  function ensureBuffer() {
    if (currentIndex.value <= text.value.length - BUFFER_MARGIN) return
    const extra = ' ' + textSource(EXTRA_CHARS)
    text.value += extra
    chars.value.push(...new Array(extra.length).fill('pending'))
    wordDone.value.push(...new Array(extra.length).fill(false))
  }

  // -- palabras selladas -- (esto se llama/activa cuando se tipeo bien el espacio que está en el 'spaceIndex').
  function sealWordBefore(spaceIndex) {
    const start = text.value.lastIndexOf(' ', spaceIndex - 1) + 1
    const word = chars.value.slice(start, spaceIndex)
    if (word.length === 0 || !word.every((c) => c === 'correct')) return

    for (let i = start; i < spaceIndex; i++) wordDone.value[i] = true
    lockedUpTo.value = spaceIndex + 1
    score.value += POINTS_PER_WORD
    wordsCompleted.value += 1
  }

  // -- acciones publicas -- (devuelve correct, incorrect, o null si la entrada se ignoró)
  function typeChar(char) {
    if (status.value === 'finished') return null
    if (typeof char !== 'string' || char.length !== 1) return null
    if (currentIndex.value >= text.value.length) return null

    if (status.value === 'waiting') startTimer()

    const expected = text.value[currentIndex.value]
    const isCorrect = char === expected
    chars.value[currentIndex.value] = isCorrect ? 'correct' : 'incorrect'

    if (!isCorrect) {
      score.value = Math.max(0, score.value - PENALTY_PER_ERROR)
    } else if (expected === ' ') {
      sealWordBefore(currentIndex.value)
    }

    currentIndex.value += 1
    ensureBuffer()
    return isCorrect ? 'correct' : 'incorrect'
  }

  // devuelve true si retrocedió, false si no pudo (inicio o palabra sellada).
  function backspace() {
    if (status.value === 'finished') return false
    if (currentIndex.value <= lockedUpTo.value) return false

    currentIndex.value -= 1
    chars.value[currentIndex.value] = 'pending'
    return true
  }

  function reset() {
    stopTimer()
    const newText = textSource(minCharsFor(duration.value))
    status.value = 'waiting'
    timeLeft.value = duration.value
    text.value = newText
    chars.value = new Array(newText.length).fill('pending')
    wordDone.value = new Array(newText.length).fill(false)
    currentIndex.value = 0
    lockedUpTo.value = 0
    score.value = 0
    wordsCompleted.value = 0
  }

  function setDuration(seconds) {
    if (status.value === 'running') return
    duration.value = seconds
    reset()
  }

  // -- ciclo de vida --
  if (getCurrentScope()) onScopeDispose(stopTimer)

  reset()

  return {
    //estado
    duration,
    status,
    timeLeft,
    text,
    chars,
    wordDone,
    currentIndex,
    score,
    wordsCompleted,
    //derivados
    wpm,
    accuracy,
    //acciones
    typeChar,
    backspace,
    reset,
    setDuration,
  }
}
