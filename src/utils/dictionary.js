import { normalizeText } from './glosario'

export const ALL_COUNTRY = 'Todo el país'
export const MAX_QUERY_LENGTH = 60

/** 'Argentina' y 'Argentina y otros paises' se agrupan como 'Todo el pais' */
export function regionGroup(region) {
  return region.startsWith('Argentina') ? ALL_COUNTRY : region
}

/** opciones del filtro de lugar: 'Todo el pais' primero y el resto en orden alfabetico */
export function regionOptions(entries) {
  const regions = new Set(entries.map((entry) => regionGroup(entry.region)))
  regions.delete(ALL_COUNTRY)
  return [ALL_COUNTRY, ...[...regions].sort((a, b) => a.localeCompare(b, 'es'))]
}

/** orden alfabetico por término, sin que importen mayusculas ni tildes. no modifica el original */
export function sortEntries(entries) {
  return [...entries].sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }))
}

/** 'category' y 'region' vacios significan <todos> */
export function filterEntries(entries, { query = '', category = '', region = '' } = {}) {
  const needle = normalizeText(query.trim())

  return entries.filter((entry) => {
    if (category && entry.category !== category) return false
    if (region && regionGroup(entry.region) !== region) return false
    if (!needle) return true

    const haystack = normalizeText(
      [entry.term, ...entry.forms, entry.meaning, entry.origin ?? ''].join(' '),
    )
    return haystack.includes(needle)
  })
}

/** lee los filtros de la url y descarta lo que no sea vaalido (la url la puede escribir cualq) */
export function readFilters(routeQuery, { categories, regions }) {
  const first = (value) => String(Array.isArray(value) ? (value[0] ?? '') : (value ?? ''))
  const category = first(routeQuery.cat)
  const region = first(routeQuery.reg)

  return {
    query: first(routeQuery.q).slice(0, MAX_QUERY_LENGTH),
    category: categories.includes(category) ? category : '',
    region: regions.includes(region) ? region : '',
  }
}

/** lo contrario: arma el objeto de la url, sin incluir los filtros vacios */
export function filtersToQuery({ query, category, region }) {
  const out = {}
  if (query.trim()) out.q = query.trim()
  if (category) out.cat = category
  if (region) out.reg = region
  return out
}
