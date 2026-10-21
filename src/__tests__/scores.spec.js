import { afterEach, describe, expect, it, vi } from 'vitest'
import { createScoresService } from '../services/scores'

function fakeClient(result) {
  const query = {
    insert: vi.fn(() => Promise.resolve(result)),
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => Promise.resolve(result)),
  }
  const client = { from: vi.fn(() => query) }
  return { client, query }
}

const validScore = { nickname: 'Ema', wpm: 52, accuracy: 96, score: 180, duration: 30 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('saveScore', () => {
  it('guarda el puntaje con el apodo normalizado', async () => {
    const { client, query } = fakeClient({ error: null })
    const service = createScoresService(() => client)

    await service.saveScore({ ...validScore, nickname: '  Ema   Gómez ' })

    expect(client.from).toHaveBeenCalledWith('scores')
    expect(query.insert).toHaveBeenCalledWith({ ...validScore, nickname: 'Ema Gómez' })
  })

  it('rechaza un apodo inválido sin tocar la base', async () => {
    const { client } = fakeClient({ error: null })
    const service = createScoresService(() => client)

    await expect(service.saveScore({ ...validScore, nickname: 'a' })).rejects.toThrow('al menos 2')
    expect(client.from).not.toHaveBeenCalled()
  })

  it('traduce un error de la base a un mensaje amigable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { client } = fakeClient({ error: { message: 'boom' } })
    const service = createScoresService(() => client)

    await expect(service.saveScore(validScore)).rejects.toThrow('No se pudo guardar')
  })
})

describe('fetchTopScores', () => {
  it('pide el top de una duración, ordenado por puntaje', async () => {
    const rows = [{ id: 1, nickname: 'Ema', score: 200 }]
    const { client, query } = fakeClient({ data: rows, error: null })
    const service = createScoresService(() => client)

    const result = await service.fetchTopScores(30, 10)

    expect(result).toEqual(rows)
    expect(query.eq).toHaveBeenCalledWith('duration', 30)
    expect(query.order).toHaveBeenNthCalledWith(1, 'score', { ascending: false })
    expect(query.order).toHaveBeenNthCalledWith(2, 'wpm', { ascending: false })
    expect(query.order).toHaveBeenNthCalledWith(3, 'created_at', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(10)
  })

  it('lanza un error amigable si falla la consulta', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { client } = fakeClient({ data: null, error: { message: 'boom' } })
    const service = createScoresService(() => client)

    await expect(service.fetchTopScores(30)).rejects.toThrow('No se pudo cargar')
  })
})
