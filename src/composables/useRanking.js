import { ref, watch } from 'vue'
import { fetchTopScores } from '@/services/scores'

/** 'duration' tiene que ser un ref o un computed. */
export function useRanking(duration, fetcher = fetchTopScores) {
  const rows = ref([])
  const loading = ref(false)
  const error = ref('')
  let request = 0 // para ignorar respuestas de pedidos anteriores

  async function load() {
    const mine = ++request
    loading.value = true
    error.value = ''

    try {
      const data = await fetcher(duration.value)
      if (mine !== request) return
      rows.value = data
    } catch (err) {
      if (mine !== request) return
      rows.value = []
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el ranking.'
    } finally {
      if (mine === request) loading.value = false
    }
  }

  watch(duration, load, { immediate: true })

  return { rows, loading, error, reload: load }
}
