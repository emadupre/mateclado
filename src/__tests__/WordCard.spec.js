import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WordCard from '@/components/WordCard.vue'

const entry = {
  id: 'guita',
  term: 'Guita',
  category: 'argentinismo',
  region: 'Argentina',
  forms: ['guita'],
  meaning: 'Dinero.',
  origin: null,
  sources: [],
  reviewed: true,
}

describe('WordCard', () => {
  it('muestra el término, el tipo, el lugar y el significado', () => {
    const text = mount(WordCard, { props: { entry } }).text()
    expect(text).toContain('Guita')
    expect(text).toContain('Argentinismo · Argentina')
    expect(text).toContain('Dinero.')
  })

  it('usa un h3 por defecto y permite cambiar el nivel', () => {
    expect(mount(WordCard, { props: { entry } }).find('h3.term').exists()).toBe(true)
    const wrapper = mount(WordCard, { props: { entry, headingLevel: 2 } })
    expect(wrapper.find('h2.term').exists()).toBe(true)
  })

  it('avisa cuando no hay origen documentado y lista las fuentes si las hay', () => {
    expect(mount(WordCard, { props: { entry } }).text()).toContain('Todavía no está documentado')

    const withSources = { ...entry, origin: 'Del lunfardo.', sources: ['Fuente A', 'Fuente B'] }
    const text = mount(WordCard, { props: { entry: withSources } }).text()
    expect(text).toContain('Del lunfardo.')
    expect(text).toContain('Fuente A; Fuente B')
  })
})
