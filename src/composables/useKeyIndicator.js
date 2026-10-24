import { getCurrentScope, onScopeDispose, ref } from 'vue'

export function keyLabel(key) {
  if (key === ' ') return '␣'
  if (key === 'Backspace') return '⌫'
  return key.length === 1 ? key.toUpperCase() : key
}

export function useKeyIndicator(pulseMs = 220) {
  const label = ref('')
  const active = ref(false)
  let timer = null

  function press(key) {
    label.value = keyLabel(key)
    active.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      active.value = false
    }, pulseMs)
  }

  function clear() {
    clearTimeout(timer)
    label.value = ''
    active.value = false
  }

  if (getCurrentScope()) onScopeDispose(() => clearTimeout(timer))

  return { label, active, press, clear }
}
