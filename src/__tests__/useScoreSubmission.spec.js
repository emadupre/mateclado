import { describe, expect, it, vi } from 'vitest'
import { useScoreSubmission } from '@/composables/useScoreSubmission'

const entry = { nickname: 'Ema', wpm: 50, accuracy: 95, score: 120, duration: 30 }

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useScoreSubmission', () => {
  it('arranca un reposo', () => {
    const s = useScoreSubmission(vi.fn())
    expect(s.status.value).toBe('idle')
    expect(s.error.value).toBe('')
  })

  it('pasa por "saving" y termina en "saved"', async () => {
    const d = deferred()
    const save = vi.fn(() => d.promise)
    const s = useScoreSubmission(save)

    const result = s.submit(entry)
    expect(s.status.value).toBe('saving')
    expect(save).toHaveBeenCalledWith(entry)

    d.resolve()
    expect(await result).toBe(true)
    expect(s.status.value).toBe('saved')
  })

  it('guarda el mensaje de error y deja reintentar', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce()
    const s = useScoreSubmission(save)

    expect(await s.submit(entry)).toBe(false)
    expect(s.status.value).toBe('error')
    expect(s.error.value).toBe('Sin conexión')

    expect(await s.submit(entry)).toBe(true)
    expect(s.status.value).toBe('saved')
    expect(s.error.value).toBe('')
  })

  it('usa un mensaje genérico si el error no trae uno', async () => {
    const s = useScoreSubmission(vi.fn().mockRejectedValue('boom'))
    await s.submit(entry)
    expect(s.error.value).toMatch(/No se pudo guardar/)
  })

  it('no permite guardar dos veces el mismo resultado', async () => {
    const save = vi.fn().mockResolvedValue()
    const s = useScoreSubmission(save)

    await s.submit(entry)
    expect(await s.submit(entry)).toBe(false)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('ignora un segundo envío mientras el primero sigue en curso', async () => {
    const d = deferred()
    const save = vi.fn(() => d.promise)
    const s = useScoreSubmission(save)

    const first = s.submit(entry)
    expect(await s.submit(entry)).toBe(false)
    expect(save).toHaveBeenCalledTimes(1)

    d.resolve()
    await first
  })

  it('clearError limpia el estado de error', async () => {
    const s = useScoreSubmission(vi.fn().mockRejectedValue(new Error('x')))
    await s.submit(entry)

    s.clearError()
    expect(s.status.value).toBe('idle')
    expect(s.error.value).toBe('')
  })

  it('reset descarta una respuesta que llega tarde', async () => {
    const d = deferred()
    const s = useScoreSubmission(vi.fn(() => d.promise))

    const pending = s.submit(entry)
    s.reset() // el jugador arrancó otra partidaa
    d.resolve()
    await pending

    expect(s.status.value).toBe('idle')
  })
})
