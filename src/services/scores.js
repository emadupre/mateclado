import { normalizeNickname, validateNickname } from '@/utils/nickname'
import { getSupabase } from './supabase'

/**
 * 'getClient' es inyectable para testear sin una base de datos real.
 */
export function createScoresService(getClient = getSupabase) {
  async function saveScore({ nickname, wpm, accuracy, score, duration }) {
    const problem = validateNickname(nickname)
    if (problem) throw new Error(problem)

    const { error } = await getClient()
      .from('scores')
      .insert({ nickname: normalizeNickname(nickname), wpm, accuracy, score, duration })

    if (error) {
      console.error('Error al guardar el puntaje:', error)
      throw new Error('No se pudo guardar el puntaje. Probá de nuevo en un rato.')
    }
  }

  async function fetchTopScores(duration, limit = 20) {
    const { data, error } = await getClient()
      .from('scores')
      .select('id, nickname, wpm, accuracy, score, duration, created_at')
      .eq('duration', duration)
      .order('score', { ascending: false })
      .order('wpm', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error al cargar el ranking:', error)
      throw new Error('No se pudo cargar el ranking.')
    }
    return data
  }

  return { saveScore, fetchTopScores }
}
export const { saveScore, fetchTopScores } = createScoresService()
