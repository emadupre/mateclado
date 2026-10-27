import { validateContribution } from './contribution'
import { findWords } from './glosario'

export function rowToEntry(row, blocked = []) {
  const { errors, clean } = validateContribution(row)
  if (Object.keys(errors).length) return null

  const usesBlocked = (text) => findWords(text, text.length, blocked).length > 0
  if (usesBlocked(clean.term) || usesBlocked(clean.example)) return null

  return {
    id: `c-${row.id}`,
    term: clean.term,
    category: clean.region === 'Argentina' ? 'argentinismo' : 'regional',
    region: clean.region,
    forms: [clean.term],
    meaning: clean.meaning,
    origin: clean.origin,
    sources: clean.source ? [clean.source] : [],
    example: clean.example,
    contributor: clean.contributor,
    reviewed: true,
    allAges: true,
    note: null,
  }
}

export function entriesFromRows(rows, blocked = []) {
  const list = Array.isArray(rows) ? rows : []
  return list.map((row) => rowToEntry(row, blocked)).filter(Boolean)
}
