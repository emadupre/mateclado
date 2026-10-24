import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { fetchTopScores } from '@/services/scores'
import RankingView from '@/views/RankingView.vue'

vi.mock('@/services/scores', () => ({ fetchTopScores: vi.fn() }))

const rows = [
  { id: 1, nickname: 'Ema', wpm: 60, accuracy: 97, score: 240, duration: 30 },
  { id: 2, nickname: 'Lu', wpm: 50, accuracy: 94, score: 190, duration: 30 },
]

async function mountAt(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => null } },
      { path: '/ranking', name: 'ranking', component: RankingView },
    ],
  })
  router.push(path)
  await router.isReady()

  const wrapper = mount(RankingView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('RankingView', () => {
  beforeEach(() => {
    fetchTopScores.mockReset()
    fetchTopScores.mockResolvedValue(rows)
  })

  it('muestra el ranking de 30s por defecto', async () => {
    const { wrapper } = await mountAt('/ranking')

    expect(fetchTopScores).toHaveBeenCalledWith(30)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('Ema')
    expect(wrapper.text()).toContain('240')
  })

  it('respeta la duración de la URL', async () => {
    await mountAt('/ranking?d=60')
    expect(fetchTopScores).toHaveBeenCalledWith(60)
  })

  it('ignora una duración inválida en la URL', async () => {
    await mountAt('/ranking?d=abc')
    expect(fetchTopScores).toHaveBeenCalledWith(30)
  })

  it('cambiar la duración actualiza la URL y pide el ranking de nuevo', async () => {
    const { wrapper, router } = await mountAt('/ranking')

    await wrapper.findAll('.modes button')[2].trigger('click') // 60s
    await flushPromises()

    expect(router.currentRoute.value.query.d).toBe('60')
    expect(fetchTopScores).toHaveBeenLastCalledWith(60)
  })

  it('avisa cuando todavía no hay puntajes', async () => {
    fetchTopScores.mockResolvedValue([])
    const { wrapper } = await mountAt('/ranking')

    expect(wrapper.text()).toContain('Todavía no hay puntajes')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('muestra el error y permite reintentar', async () => {
    fetchTopScores.mockRejectedValueOnce(new Error('No se pudo cargar el ranking.'))
    const { wrapper } = await mountAt('/ranking')

    expect(wrapper.find('[role="alert"]').text()).toContain('No se pudo cargar')

    await wrapper.find('.retry').trigger('click')
    await flushPromises()

    expect(fetchTopScores).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })
})
