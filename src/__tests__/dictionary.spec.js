import { describe, expect, it } from 'vitest'
import {
  ALL_COUNTRY,
  filterEntries,
  filtersToQuery,
  readFilters,
  regionGroup,
  regionOptions,
  sortEntries,
} from '@/utils/dictionary'

const entries = [
  {
    id: 'guita',
    term: 'Guita',
    category: 'argentinismo',
    region: 'Argentina',
    forms: ['guita'],
    meaning: 'Dinero.',
    origin: null,
  },
  {
    id: 'capo',
    term: 'Capo',
    category: 'argentinismo',
    region: 'Argentina',
    forms: ['capo', 'capos'],
    meaning: 'Persona que se destaca.',
    origin: 'Viene del italiano «capo».',
  },
  {
    id: 'pandito',
    term: 'Pandito',
    category: 'regional',
    region: 'San Luis',
    forms: ['pandito'],
    meaning: 'Lugar poco profundo.',
    origin: null,
  },
  {
    id: 'plomero',
    term: 'Plomero',
    category: 'argentinismo',
    region: 'Argentina y otros países',
    forms: ['plomero'],
    meaning: 'Persona que arregla cañerías.',
    origin: null,
  },
]
const ids = (list) => list.map((entry) => entry.id)

describe('regionGroup', () => {
  it('agrupa las variantes de «Argentina» como todo el país', () => {
    expect(regionGroup('Argentina')).toBe(ALL_COUNTRY)
    expect(regionGroup('Argentina y otros países')).toBe(ALL_COUNTRY)
  })

  it('deja las demás regiones como están', () => {
    expect(regionGroup('San Luis')).toBe('San Luis')
  })
})

describe('regionOptions', () => {
  it('pone «Todo el país» primero y no repite regiones', () => {
    expect(regionOptions(entries)).toEqual([ALL_COUNTRY, 'San Luis'])
  })

  it('ordena las provincias alfabéticamente', () => {
    const sample = [{ region: 'Tucumán' }, { region: 'Chubut' }, { region: 'Argentina' }]
    expect(regionOptions(sample)).toEqual([ALL_COUNTRY, 'Chubut', 'Tucumán'])
  })
})

describe('sortEntries', () => {
  it('ordena sin importar mayúsculas ni tildes', () => {
    const sorted = sortEntries([{ term: 'pibe' }, { term: 'Álamo' }, { term: 'Che' }])
    expect(sorted.map((entry) => entry.term)).toEqual(['Álamo', 'Che', 'pibe'])
  })

  it('no modifica el arreglo original', () => {
    const original = [{ term: 'b' }, { term: 'a' }]
    sortEntries(original)
    expect(original.map((entry) => entry.term)).toEqual(['b', 'a'])
  })
})

describe('filterEntries', () => {
  it('sin filtros devuelve todo', () => {
    expect(filterEntries(entries)).toHaveLength(4)
    expect(filterEntries(entries, { query: '   ' })).toHaveLength(4)
  })

  it('busca en el término', () => {
    expect(ids(filterEntries(entries, { query: 'guita' }))).toEqual(['guita'])
  })

  it('busca en el significado', () => {
    expect(ids(filterEntries(entries, { query: 'dinero' }))).toEqual(['guita'])
  })

  it('busca en el origen', () => {
    expect(ids(filterEntries(entries, { query: 'italiano' }))).toEqual(['capo'])
  })

  it('busca en las variantes', () => {
    expect(ids(filterEntries(entries, { query: 'capos' }))).toEqual(['capo'])
  })

  it('ignora mayúsculas y tildes', () => {
    expect(ids(filterEntries(entries, { query: 'CAÑERÍAS' }))).toEqual(['plomero'])
  })

  it('filtra por tipo', () => {
    expect(ids(filterEntries(entries, { category: 'regional' }))).toEqual(['pandito'])
  })

  it('filtra por lugar', () => {
    expect(ids(filterEntries(entries, { region: ALL_COUNTRY }))).toEqual([
      'guita',
      'capo',
      'plomero',
    ])
    expect(ids(filterEntries(entries, { region: 'San Luis' }))).toEqual(['pandito'])
  })

  it('combina los filtros', () => {
    expect(ids(filterEntries(entries, { query: 'persona', region: ALL_COUNTRY }))).toEqual([
      'capo',
      'plomero',
    ])
  })

  it('devuelve una lista vacía si nada coincide', () => {
    expect(filterEntries(entries, { query: 'zzz' })).toEqual([])
  })
})

describe('readFilters', () => {
  const options = { categories: ['argentinismo', 'regional'], regions: [ALL_COUNTRY, 'San Luis'] }

  it('lee valores válidos', () => {
    expect(readFilters({ q: 'capo', cat: 'regional', reg: 'San Luis' }, options)).toEqual({
      query: 'capo',
      category: 'regional',
      region: 'San Luis',
    })
  })

  it('descarta categorías y lugares que no existen', () => {
    expect(readFilters({ cat: 'nada', reg: 'Marte' }, options)).toEqual({
      query: '',
      category: '',
      region: '',
    })
  })

  it('tolera parámetros ausentes, vacíos o repetidos', () => {
    expect(readFilters({}, options).query).toBe('')
    expect(readFilters({ q: null }, options).query).toBe('')
    expect(readFilters({ q: ['uno', 'dos'] }, options).query).toBe('uno')
  })

  it('recorta una búsqueda demasiado larga', () => {
    expect(readFilters({ q: 'x'.repeat(200) }, options).query).toHaveLength(60)
  })
})

describe('filtersToQuery', () => {
  it('omite los filtros vacíos', () => {
    expect(filtersToQuery({ query: '', category: '', region: '' })).toEqual({})
  })

  it('incluye los filtros activos y recorta la búsqueda', () => {
    expect(filtersToQuery({ query: ' capo ', category: 'regional', region: 'San Luis' })).toEqual({
      q: 'capo',
      cat: 'regional',
      reg: 'San Luis',
    })
  })
})
