import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { fetchApprovedContributions } from '@/services/contributions'
import { saveScore } from '@/services/scores'
import { buildText } from '@/utils/buildText'
import HomeView from '@/views/HomeView.vue'

vi.mock('@/services/scores', () => ({ saveScore: vi.fn() }))
vi.mock('@/services/contributions', () => ({ fetchApprovedContributions: vi.fn() }))
vi.mock('@/utils/buildText', () => ({
  buildText: vi.fn(() => 'hola mundo '.repeat(40).trim()),
}))

const approvedRow = {
  id: 'abc-123',
  term: 'Pandito',
  region: 'San Luis',
  meaning: 'Lugar poco profundo.',
  example: 'Los chicos jugaban en el pandito del arroyo.',
  origin: null,
  source: null,
  contributor: 'Lu',
}

function mountHome() {
  return mount(HomeView, {
    global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

// 'hola mundo hola ': 16 caracteres bien, 3 palabras selladas
// → 6 ppm, 100% de precisión, 30 puntos
async function playUntilFinished(wrapper, typed = 'hola mundo hola ') {
  const zone = wrapper.find('.type-zone')
  for (const key of typed) await zone.trigger('keydown', { key })
  vi.advanceTimersByTime(30000)
  await nextTick()
}

describe('HomeView', () => {
  beforeEach(() => {
    // no falseamos setImmediate para que flushPromises siga funcionando
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
    localStorage.clear()
    saveScore.mockReset()
    saveScore.mockResolvedValue(undefined)
    fetchApprovedContributions.mockReset()
    fetchApprovedContributions.mockResolvedValue([])
    buildText.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el logo y el texto a tipear', () => {
    const wrapper = mountHome()
    expect(wrapper.text()).toContain('mateclado')
    expect(wrapper.findAll('.ch').length).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('al tipear la primera letra arranca el test', async () => {
    const wrapper = mountHome()
    expect(wrapper.text()).not.toMatch(/ppm/)

    await wrapper.find('.type-zone').trigger('keydown', { key: 'h' })

    expect(wrapper.text()).toMatch(/\d+s · \d+ ppm · \d+ pts/)
    wrapper.unmount()
  })

  it('Escape reinicia el test', async () => {
    const wrapper = mountHome()
    const zone = wrapper.find('.type-zone')

    await zone.trigger('keydown', { key: 'h' })
    expect(wrapper.text()).toMatch(/ppm/)

    await zone.trigger('keydown', { key: 'Escape' })
    expect(wrapper.text()).not.toMatch(/ppm/)
    wrapper.unmount()
  })

  it('cambiar la duración actualiza el selector', async () => {
    const wrapper = mountHome()
    const buttons = wrapper.findAll('.modes button')

    expect(buttons[1].classes()).toContain('active') // 30s por defecto
    await buttons[2].trigger('click') // 60s
    expect(buttons[2].classes()).toContain('active')
    expect(buttons[1].classes()).not.toContain('active')
    wrapper.unmount()
  })

  it('al terminar muestra los resultados y el formulario para guardar', async () => {
    const wrapper = mountHome()
    await playUntilFinished(wrapper)

    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.find('input[name="nickname"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('con 0 ppm no ofrece guardar el puntaje', async () => {
    const wrapper = mountHome()
    await playUntilFinished(wrapper, 'h')

    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
    wrapper.unmount()
  })

  it('guarda el puntaje con el apodo y lo recuerda', async () => {
    const wrapper = mountHome()
    await playUntilFinished(wrapper)

    await wrapper.find('input[name="nickname"]').setValue('  Ema ')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(saveScore).toHaveBeenCalledWith({
      nickname: '  Ema ', // la normalización la hace el servicio
      wpm: 6,
      accuracy: 100,
      score: 30,
      duration: 30,
    })
    expect(wrapper.text()).toContain('Puntaje guardado')
    expect(localStorage.getItem('mateclado:nickname')).toBe('Ema')
    wrapper.unmount()
  })

  it('muestra el error si falla y deja reintentar', async () => {
    saveScore.mockRejectedValueOnce(new Error('No se pudo guardar el puntaje.'))
    const wrapper = mountHome()
    await playUntilFinished(wrapper)

    await wrapper.find('input[name="nickname"]').setValue('Ema')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.error').text()).toContain('No se pudo guardar')
    expect(wrapper.find('input[name="nickname"]').exists()).toBe(true)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(saveScore).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Puntaje guardado')
    wrapper.unmount()
  })

  it('precarga el apodo recordado de partidas anteriores', async () => {
    localStorage.setItem('mateclado:nickname', 'Ema')
    const wrapper = mountHome()
    await playUntilFinished(wrapper)

    expect(wrapper.find('input[name="nickname"]').element.value).toBe('Ema')
    wrapper.unmount()
  })

  it('Escape reinicia desde los resultados, pero no mientras escribís el apodo', async () => {
    const wrapper = mount(HomeView, {
      attachTo: document.body, // hace falta para que el foco funcione de verdad
      global: { plugins: [createPinia()], stubs: { RouterLink: RouterLinkStub } },
    })
    await playUntilFinished(wrapper)

    const input = wrapper.find('input[name="nickname"]')
    input.element.focus()
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.results').exists()).toBe(true) // sigue en resultados

    input.element.blur()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false) // volvió a jugar
    wrapper.unmount()
  })

  it('suma las frases aprobadas por la comunidad al banco del juego', async () => {
    fetchApprovedContributions.mockResolvedValue([approvedRow])
    const wrapper = mountHome()
    await flushPromises()

    const [, options] = buildText.mock.calls.at(-1)
    expect(options.phrases).toContain(approvedRow.example)
    wrapper.unmount()
  })

  it('no renueva el texto si ya empezaste a tipear cuando llegan las frases', async () => {
    let deliver
    fetchApprovedContributions.mockReturnValue(
      new Promise((resolve) => {
        deliver = resolve
      }),
    )
    const wrapper = mountHome()
    await wrapper.find('.type-zone').trigger('keydown', { key: 'h' })
    const callsBefore = buildText.mock.calls.length

    deliver([approvedRow])
    await flushPromises()

    expect(buildText.mock.calls.length).toBe(callsBefore)
    wrapper.unmount()
  })
})
