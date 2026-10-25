import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveContribution } from '@/services/contributions'
import ContributeView from '@/views/ContributeView.vue'

vi.mock('@/services/contributions', () => ({ saveContribution: vi.fn() }))

function mountForm(options = {}) {
  return mount(ContributeView, {
    global: { stubs: { RouterLink: RouterLinkStub } },
    ...options,
  })
}

async function fillValid(wrapper) {
  await wrapper.find('#term').setValue('Pandito')
  await wrapper.find('#region').setValue('San Luis')
  await wrapper.find('#meaning').setValue('Lugar poco profundo.')
  await wrapper.find('#example').setValue('Los chicos jugaban en el pandito del arroyo.')
}

async function submit(wrapper) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ContributeView', () => {
  beforeEach(() => {
    saveContribution.mockReset()
    saveContribution.mockResolvedValue(undefined)
  })

  it('muestra los errores y no envía nada si el formulario está incompleto', async () => {
    const wrapper = mountForm()
    await submit(wrapper)

    expect(saveContribution).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Elegí de dónde es la palabra.')
    expect(wrapper.findAll('.error').length).toBeGreaterThan(0)
  })

  it('lleva el foco al primer campo con error', async () => {
    const wrapper = mountForm({ attachTo: document.body })
    await submit(wrapper)

    expect(document.activeElement.id).toBe('term')
    wrapper.unmount()
  })

  it('los errores desaparecen a medida que se corrigen', async () => {
    const wrapper = mountForm()
    await submit(wrapper)
    expect(wrapper.findAll('.error').length).toBeGreaterThan(0)

    await fillValid(wrapper)
    expect(wrapper.findAll('.error')).toHaveLength(0)
  })

  it('envía el aporte y da las gracias', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await submit(wrapper)

    expect(saveContribution).toHaveBeenCalledWith(
      expect.objectContaining({ term: 'Pandito', region: 'San Luis' }),
    )
    expect(wrapper.text()).toContain('Gracias por tu aporte')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('muestra el error del envío y deja reintentar', async () => {
    saveContribution.mockRejectedValueOnce(new Error('No se pudo enviar tu aporte.'))
    const wrapper = mountForm()
    await fillValid(wrapper)
    await submit(wrapper)

    expect(wrapper.find('.send-error').text()).toContain('No se pudo enviar')
    expect(wrapper.find('form').exists()).toBe(true)

    await submit(wrapper)
    expect(saveContribution).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Gracias por tu aporte')
  })

  it('si el campo trampa viene completo, simula el envío pero no manda nada', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await wrapper.find('#trampa').setValue('soy un bot')
    await submit(wrapper)

    expect(saveContribution).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Gracias por tu aporte')
  })

  it('permite aportar otra palabra con el formulario vacío', async () => {
    const wrapper = mountForm()
    await fillValid(wrapper)
    await submit(wrapper)

    await wrapper.find('.secondary').trigger('click')

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#term').element.value).toBe('')
  })
})
