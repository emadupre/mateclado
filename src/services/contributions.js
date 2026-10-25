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

  return { saveContribution }
}

export const { saveContribution } = createContributionsService()
