import { validateContribution } from '@/utils/contribution'
import { getSupabase } from './supabase'

export function createContributionsService(getClient = getSupabase) {
  async function saveContribution(draft) {
    const { errors, clean } = validateContribution(draft)
    const [first] = Object.values(errors)
    if (first) throw new Error(first)

    // solo viajan las columnas de 'clean': cualquier otro campo del formulario se descarta
    const { error } = await getClient().from('contributions').insert(clean)

    if (error) {
      console.error('Error al enviar el aporte:', error)
      throw new Error('No se pudo enviar tu aporte, Probá de nuevo en un rato.')
    }
  }

  async function fetchApproved(limit = 50) {
    const { data, error } = await getClient()
      .from('contributions')
      .select('id,term,region,meaning,example,origin,source,contributor')
      .eq('status', 'approved')
      .order('term')
      .limit(limit)
    if (error) {
      console.error('Error al cargar las palabras aportadas: ', Error)
      throw new Error('No se pudieron cargar las palabras de la comunidad.')
    }
    return data ?? []
  }

  return { saveContribution, fetchApproved }
}

export const { saveContribution, fetchApproved: fetchApprovedContributions } =
  createContributionsService()
