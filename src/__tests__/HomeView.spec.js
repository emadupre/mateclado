import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeView from '../views/HomeView.vue'

const firstChar = (wrapper) => wrapper.find('.ch').text()

describe('HomeView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el logo y el texto a tipear', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('mateclado')
    expect(wrapper.findAll('.ch').length).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('al tipear la primera letra arranca el test', async () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).not.toMatch(/ppm/)

    await wrapper.find('.type-zone').trigger('keydown', { key: firstChar(wrapper) })

    expect(wrapper.text()).toMatch(/\d+s · \d+ ppm · \d+ pts/)
    wrapper.unmount()
  })

  it('Escape reinicia el test', async () => {
    const wrapper = mount(HomeView)
    const zone = wrapper.find('.type-zone')

    await zone.trigger('keydown', { key: firstChar(wrapper) })
    expect(wrapper.text()).toMatch(/ppm/)

    await zone.trigger('keydown', { key: 'Escape' })
    expect(wrapper.text()).not.toMatch(/ppm/)
    wrapper.unmount()
  })

  it('cambiar la duración actualiza el selector', async () => {
    const wrapper = mount(HomeView)
    const buttons = wrapper.findAll('.modes button')

    expect(buttons[1].classes()).toContain('active') // 30s por defecto
    await buttons[2].trigger('click') // 60s
    expect(buttons[2].classes()).toContain('active')
    expect(buttons[1].classes()).not.toContain('active')
    wrapper.unmount()
  })
})
