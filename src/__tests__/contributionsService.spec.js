import { afterEach, describe, expect, it, vi } from 'vitest'
import { createContributionsService } from '@/services/contributions'

const draft = {
  term: ' Pandito ',
  region: 'San Luis',
  meaning: 'Lugar poco profundo.',
  example: 'Los chicos jugaban en el pandito del arroyo.',
  origin: '',
  source: '',
  contributor: '',
  trampa: '',
}

function fakeClient(result) {
  const query = { insert: vi.fn(() => Promise.resolve(result)) }
  return { client: { from: vi.fn(() => query) }, query }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('saveContribution', () => {
  it('inserta solo las columnas limpias, sin el campo trampa', async () => {
    const { client, query } = fakeClient({ error: null })
    const service = createContributionsService(() => client)

    await service.saveContribution(draft)

    expect(client.from).toHaveBeenCalledWith('contributions')
    expect(query.insert).toHaveBeenCalledWith({
      term: 'Pandito',
      region: 'San Luis',
      meaning: 'Lugar poco profundo.',
      example: 'Los chicos jugaban en el pandito del arroyo.',
      origin: null,
      source: null,
      contributor: null,
    })
  })

  it('rechaza un aporte inválido sin tocar la base', async () => {
    const { client } = fakeClient({ error: null })
    const service = createContributionsService(() => client)

    await expect(service.saveContribution({ ...draft, term: 'a' })).rejects.toThrow('mínimo 2')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('traduce un error de la base a un mensaje amigable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { client } = fakeClient({ error: { message: 'boom' } })
    const service = createContributionsService(() => client)

    await expect(service.saveContribution(draft)).rejects.toThrow('No se pudo enviar')
  })
})
