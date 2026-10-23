import { ref } from 'vue'
import { saveScore } from '@/services/scores'

export function useScoreSubmission(save = saveScore) {
  const status = ref('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const error = ref('')
  let generation = 0 // cambia con cada reset, para descartar respuestas de partidas anteriores.

  /** Devuelve el true solo si el puntaje se guardó.*/
  async function submit(entry) {
    if (status.value === 'saving' || status.value === 'saved') return false

    const mine = generation
    status.value = 'saving'
    error.value = ''

    try {
      await save(entry)
      if (mine !== generation) return false
      status.value = 'saved'
      return true
    } catch (err) {
      if (mine !== generation) return false
      error.value = err instanceof Error ? err.message : 'No se pudo guardar el puntaje.'
      status.value = 'error'
      return false
    }
  }

  function clearError() {
    if (status.value !== 'error') return
    status.value = 'idle'
    error.value = ''
  }

  function reset() {
    generation += 1
    status.value = 'idle'
    error.value = ''
  }

  return { status, error, submit, clearError, reset }
}
