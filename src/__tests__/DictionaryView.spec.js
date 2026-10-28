import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { fetchApprovedContributions } from '@/services/contributions'
import DictionaryView from '@/views/DictionaryView.vue'

vi.mock('@/services/contributions', () => ({ fetchApprovedContributions: vi.fn() }))

vi.mock('@/data/glosario', () => {
  const base = {
    category: 'argentinismo',
    region: 'Argentina',
    origin: null,
    sources: [],
    reviewed: true,
    allAges: true,
  }
  return {
    CATEGORIES: { argentinismo: 'Argentinismo', regional: 'Regional' },
    GLOSARIO: [
      { ...base, id: 'guita', term: 'Guita', forms: ['guita'], meaning: 'Dinero.' },
      { ...base, id: 'capo', term: 'Capo', forms: ['capo'], meaning: 'Persona que se destaca.' },
      {
        ...base,
        id: 'pandito',
        term: 'Pandito',
        category: 'regional',
        region: 'San Luis',
        forms: ['pandito'],
        meaning: 'Lugar poco profundo.',
      },
    ],
  }
})

const approved = {
  id: 'abc',
  term: 'Tucumano',
  region: 'Tucumán',
  meaning: 'Algo de ejemplo para la prueba.',
  example: 'El tucumano llegó temprano a la plaza.',
  origin: null,
  source: null,
  contributor: 'Lu',
}

async function mountAt(path = '/diccionario') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { render: () => null } },
      { path: '/ranking', component: { render: () => null } },
      { path: '/diccionario', component: { render: () => null } },
      { path: '/aportar', component: { render: () => null } },
    ],
  })
  router.push(path)
  await router.isReady()

  const wrapper = mount(DictionaryView, { global: { plugins: [router, createPinia()] } })
  await flushPromises()
  return { wrapper, router }
}

const terms = (wrapper) => wrapper.findAll('.term').map((node) => node.text())

beforeEach(() => {
  fetchApprovedContributions.mockReset()
  fetchApprovedContributions.mockResolvedValue([])
})

describe('DictionaryView', () => {
  it('lista todas las palabras en orden alfabético', async () => {
    const { wrapper } = await mountAt()
    expect(terms(wrapper)).toEqual(['Capo', 'Guita', 'Pandito'])
    expect(wrapper.text()).toContain('3 de 3 palabras')
  })

  it('la búsqueda filtra por significado', async () => {
    const { wrapper } = await mountAt()
    await wrapper.find('#q').setValue('dinero')

    expect(terms(wrapper)).toEqual(['Guita'])
    expect(wrapper.text()).toContain('1 de 3 palabras')
  })

  it('filtra por lugar', async () => {
    const { wrapper } = await mountAt()
    await wrapper.find('#reg').setValue('San Luis')
    expect(terms(wrapper)).toEqual(['Pandito'])
  })

  it('filtra por tipo', async () => {
    const { wrapper } = await mountAt()
    await wrapper.find('#cat').setValue('regional')
    expect(terms(wrapper)).toEqual(['Pandito'])
  })

  it('avisa cuando no hay resultados y permite limpiar los filtros', async () => {
    const { wrapper } = await mountAt()
    await wrapper.find('#q').setValue('zzz')

    expect(wrapper.text()).toContain('No encontramos ninguna palabra')
    expect(wrapper.findAll('.word-card')).toHaveLength(0)

    await wrapper.find('.clear').trigger('click')
    expect(wrapper.findAll('.word-card')).toHaveLength(3)
    expect(wrapper.find('#q').element.value).toBe('')
  })

  it('la URL refleja los filtros', async () => {
    const { wrapper, router } = await mountAt()

    await wrapper.find('#q').setValue('dinero')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ q: 'dinero' })

    await wrapper.find('#q').setValue('')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('lee los filtros desde la URL', async () => {
    const { wrapper } = await mountAt('/diccionario?q=capo')
    expect(terms(wrapper)).toEqual(['Capo'])
    expect(wrapper.find('#q').element.value).toBe('capo')
  })

  it('ignora filtros inválidos de la URL', async () => {
    const { wrapper } = await mountAt('/diccionario?cat=nada&reg=Marte')
    expect(wrapper.findAll('.word-card')).toHaveLength(3)
  })

  it('suma las palabras aprobadas de la comunidad y muestra quién las aportó', async () => {
    fetchApprovedContributions.mockResolvedValue([approved])
    const { wrapper } = await mountAt()

    expect(terms(wrapper)).toEqual(['Capo', 'Guita', 'Pandito', 'Tucumano'])
    expect(wrapper.text()).toContain('Aportada por Lu')
  })

  it('un enlace con un lugar de la comunidad conserva el filtro aunque cargue después', async () => {
    fetchApprovedContributions.mockResolvedValue([approved])
    const { wrapper } = await mountAt('/diccionario?reg=Tucumán')

    expect(terms(wrapper)).toEqual(['Tucumano'])
  })

  it('avisa si no se pudieron cargar las palabras de la comunidad y muestra el resto', async () => {
    fetchApprovedContributions.mockRejectedValue(new Error('sin conexión'))
    const { wrapper } = await mountAt()

    expect(wrapper.text()).toContain('No pudimos cargar las palabras de la comunidad')
    expect(terms(wrapper)).toEqual(['Capo', 'Guita', 'Pandito'])
  })
})
