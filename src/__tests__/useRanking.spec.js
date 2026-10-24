import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useRanking } from '@/composables/useRanking'

const rowsA = [{ id: 1, nickname: 'Ema' }]
const rowsB = [{ id: 2, nickname: 'Cele' }]

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useRanking', () => {
  it('carga el ranking apenas se crea', async () => {
    const fetcher = vi.fn().mockResolvedValue(rowsA)
    const r = useRanking(ref(30), fetcher)

    expect(r.loading.value).toBe(true)
    expect(fetcher).toHaveBeenCalledWith(30)

    await flushPromises()
    expect(r.rows.value).toEqual(rowsA)
    expect(r.loading.value).toBe(false)
    expect(r.error.value).toBe('')
  })

  it('guarda el error y deja la lista vacia', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('No se pudo cargar el ranking.'))
    const r = useRanking(ref(30), fetcher)

    await flushPromises()
    expect(r.error.value).toBe('No se pudo cargar el ranking.')
    expect(r.rows.value).toEqual([])
    expect(r.loading.value).toBe(false)
  })

  it('vuelve a pedir los datos al cambiar la duración', async () => {
    const fetcher = vi.fn().mockRejectedValue(rowsA)
    const duration = ref(30)
    useRanking(duration, fetcher)
    await flushPromises()

    duration.value = 60
    await nextTick()
    expect(fetcher).toHaveBeenCalledWith(60)
  })

  it('ignora la respuesta de una duración anterior que llega tarde', async () => {
    const first = deferred()
    const second = deferred()
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(first.promise)
      .mockResolvedValueOnce(second.promise)
    const duration = ref(30)
    const r = useRanking(duration, fetcher)

    duration.value = 60
    await nextTick()

    second.resolve(rowsB)
    await flushPromises()
    first.resolve(rowsA) // la de 30s llega desp
    await flushPromises()

    expect(r.rows.value).toEqual(rowsB)
    expect(r.loading.value).toBe(false)
  })

  it('reload reintenta después de un error', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('falló')).mockResolvedValueOnce(rowsA)
    const r = useRanking(ref(30), fetcher)
    await flushPromises()
    expect(r.error.value).toBe('falló')

    await r.reload()
    expect(r.error.value).toBe('')
    expect(r.rows.value).toEqual(rowsA)
  })
})
