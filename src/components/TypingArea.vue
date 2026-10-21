<script setup>
import { diffInput } from '@/utils/inputOff'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  chars: { type: Array, required: true },
  wordDone: { type: Array, required: true },
  currentIndex: { type: Number, required: true },
})
const emit = defineEmits(['char', 'backspace', 'restart'])

// en el celular el teclado solo aparece si hay un campo editable con foco.
// en escritorio no hace falta, un div con foco recibe los keydowns.

const isTouch = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
const hint = isTouch ? 'tocá el texto para empezar a escribir' : 'hacé clic acá y empezá'

const zoneRef = ref(null)
const inputRef = ref(null)
const blockRef = ref(null)
const focused = ref(false)

//entrada: escritorio (keydown)
let ignoreNextInput = false

// si ya procesamos esta tecla en keydown, ignoramos el evento 'input' de la misma pulsacion
function markHandled() {
  ignoreNextInput = true
  setTimeout(() => {
    ignoreNextInput = false
  }, 0)
}

function onKeydown(e) {
  ignoreNextInput = false

  if (e.key === 'Tab' || e.key === 'Escape') {
    e.preventDefault()
    emit('restart')
    return
  }
  if (e.key === 'Backspace') {
    e.preventDefault()
    markHandled()
    emit('backspace')
    return
  }
  //dejamos pasaar los atajos como Ctrl+R (AltGr cuenta como Ctrl+Alt, así que ese si se tipea)
  if (e.metaKey || (e.ctrlKey && !e.altKey)) return

  if (e.key.length === 1) {
    e.preventDefault()
    markHandled()
    emit('char', e.key)
  }
}

// entrada: celular (input visible)
const SENTINEL = ' '
let previous = SENTINEL

function resetInput() {
  const el = inputRef.value
  if (!el) return
  el.value = SENTINEL
  previous = SENTINEL
}

function syncFromInput(isComposing) {
  const el = inputRef.value
  if (!el) return

  if (ignoreNextInput) {
    resetInput()
    return
  }

  const { backspaces, chars } = diffInput(previous, el.value)
  for (let i = 0; i < backspaces; i++) emit('backspace')
  for (const ch of chars) emit('char', ch)

  //mientras el teclado 'compone' una palabra no se toca el valor
  if (isComposing) previous = el.value
  else resetInput()
}

function onInput(e) {
  syncFromInput(e.isComposing)
}

//foco
function focus() {
  const el = isTouch ? inputRef.value : zoneRef.value
  el?.focus()
}

// caract
function charClass(i) {
  if (i === props.currentIndex) return 'ch current'
  return props.wordDone[i] ? 'ch word-done' : `ch ${props.chars[i]}`
}

// cursor deslizante
const caret = reactive({ x: 0, y: 0, height: 0 })
const blinking = ref(true)
const errorFlash = ref(false)
let blinkTimer = null
let errorTimer = null

const caretStyle = computed(() => ({
  transform: `translate(${caret.x}px, ${caret.y}px)`,
  height: `${caret.height}px`,
}))

function updateCaret() {
  const block = blockRef.value
  if (!block || props.text.length === 0) return

  const atEnd = props.currentIndex >= props.text.length
  // los hijos deel bloque son un span por caracter y, al final, el cursor
  const span = block.children[atEnd ? props.text.length - 1 : props.currentIndex]
  if (!span) return

  const blockRect = block.getBoundingClientRect()
  const rect = span.getBoundingClientRect()
  caret.x = (atEnd ? rect.right : rect.left) - blockRect.left
  caret.y = rect.top - blockRect.top
  caret.height = rect.height
}

//el cursor queda solido mientras tipeas y parpadea cuando haces una pausa
function pulseCaretSolid() {
  blinking.value = false
  clearTimeout(blinkTimer)
  blinkTimer = setTimeout(() => {
    blinking.value = true
  }, 500)
}

function flashCaretError() {
  errorFlash.value = true
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    errorFlash.value = false
  }, 160)
}

watch(
  () => props.currentIndex,
  (index, before) => {
    pulseCaretSolid()
    // flash rojo solo si avanzó y el ultimo caracter tipeado fue un error
    if (index > before && props.chars[index - 1] === 'incorrect') flashCaretError()
    nextTick(updateCaret)
  },
)
watch(
  () => props.text,
  () => nextTick(updateCaret),
)

//ciclo de vida
onMounted(() => {
  resetInput()
  focus()
  nextTick(updateCaret)
  window.addEventListener('resize', updateCaret)
})

onBeforeUnmount(() => {
  clearTimeout(blinkTimer)
  clearTimeout(errorTimer)
  window.removeEventListener('resize', updateCaret)
})

defineExpose({ focus })
</script>

<template>
  <div class="type-area" @click="focus">
    <div
      ref="zoneRef"
      class="type-zone"
      :class="{ blurred: !focused }"
      tabindex="0"
      @keydown="onKeydown"
      @focusin="focused = true"
      @focusout="focused = false"
    >
      <input
        v-if="isTouch"
        ref="inputRef"
        class="hidden-input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Escribí el texto que ves en pantalla"
        @input="onInput"
        @compositionend="syncFromInput(false)"
      />

      <div ref="blockRef" class="text-block">
        <span v-for="(c, i) in text" :key="i" :class="charClass(i)">{{ c }}</span>
        <div
          class="caret"
          :class="{ blink: blinking, error: errorFlash }"
          :style="caretStyle"
        ></div>
      </div>
    </div>
    <p class="focus-hint" :class="{ visible: !focused }">{{ hint }}</p>
  </div>
</template>

<style scoped>
.type-zone {
  position: relative;
  outline: none;
  cursor: text;
  touch-action: manipulation;
}

.text-block {
  position: relative;
  font-family: var(--font-mono);
  font-size: clamp(18px, 3.4vw, 26px);
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: var(--text-faint);
  -webkit-user-select: none;
  user-select: none;
}

.type-zone.blurred .text-block {
  opacity: 0.35;
}

/* el input existe solo para abrir el teclado virtual: invisible pero enfocable. font-size 16px evita el zoom automatico de iOS al enfocar. */
.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  opacity: 0;
  font-size: 16px;
  pointer-events: none;
}

.ch {
  white-space: pre-wrap;
  transition:
    color 0.1s ease,
    background-color 0.1s ease;
}
.ch.pending {
  color: var(--text-faint);
}
.ch.correct {
  color: var(--text);
}
.ch.incorrect {
  color: var(--error);
  background: var(--error-dim);
  border-radius: 2px;
}
.ch.word-done {
  color: var(--success);
  opacity: 0.8;
}
.ch.current {
  color: var(--text);
  background: var(--accent-soft);
  border-radius: 2px;
}

.caret {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  border-radius: 1px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  pointer-events: none;
  transition:
    transform 0.09s ease,
    height 0.09s ease,
    background-color 0.12s ease,
    box-shadow 0.12s ease;
}
.caret.blink {
  animation: blink 1s step-end infinite;
}

.caret.error {
  background: var(--error);
  box-shadow: 0 0 10px var(--error-glow);
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.focus-hint {
  margin: var(--space-3) 0 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-faint);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.focus-hint.visible {
  opacity: 1;
}
</style>
