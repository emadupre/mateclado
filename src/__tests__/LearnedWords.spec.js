import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import LearnedWords from '@/components/LearnedWords.vue'
import { exampleFor } from '@/utils/glosario'

const posta = {
  id: 'posta',
  term: 'Posta',
  category: 'argentinismo',
  region: 'Argentina',
  forms: ['posta'],
  meaning: 'Verdad.',
  origin: null,
  sources: [],
  reviewed: true,
  allAges: true,
}
const che = {
  ...posta,
  id: 'che',
  term: 'Che',
  forms: ['che'],
  meaning: 'Para llamar a alguien.',
  origin: 'Su origen es discutido.',
  reviewed: false,
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.removeAttribute('open')
  })
})

beforeEach(() => {
  vi.clearAllMocks()
})

const mountWith = (entries) => mount(LearnedWords, { props: { entries } })

describe('LearnedWords', () => {
  it('cuenta las palabras en singular y en plural', () => {
    expect(mountWith([posta]).text()).toContain('apareció 1 palabra')
    expect(mountWith([posta, che]).text()).toContain('aparecieron 2 palabras')
  })

  it('abre el cuadro al tocar el botón', async () => {
    const wrapper = mountWith([posta])
    await wrapper.find('.open').trigger('click')
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1)
  })

  it('muestra una ficha por palabra, con su significado', () => {
    const text = mountWith([posta, che]).text()
    expect(text).toContain('Posta')
    expect(text).toContain('Verdad.')
    expect(text).toContain('Para llamar a alguien.')
  })

  it('avisa cuando el origen no está documentado y muestra el que sí lo está', () => {
    const text = mountWith([posta, che]).text()
    expect(text).toContain('Todavía no está documentado')
    expect(text).toContain('Su origen es discutido.')
  })

  it('marca solo las fichas que faltan revisar', () => {
    const wrapper = mountWith([posta, che])
    expect(wrapper.findAll('.draft')).toHaveLength(1)
  })

  it('muestra como ejemplo la frase del juego donde aparece la palabra', () => {
    const wrapper = mountWith([posta])
    expect(wrapper.text()).toContain(exampleFor(posta))
  })

  it('se cierra con el botón', async () => {
    const wrapper = mountWith([posta])
    await wrapper.find('.close').trigger('click')
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1)
  })
})
