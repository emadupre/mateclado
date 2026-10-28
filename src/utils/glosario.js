import { FRASES } from '@/data/frases'

const WORD_CHAR = /[\p{L}\p{N}]/u

const stripMarks = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** minusculas y sin tildes, pero conservando la ñ (así <<caña>> no se confunde con <<cana>>) */
export function normalizeText(text) {
  return text.toLowerCase().split('ñ').map(stripMarks).join('ñ')
}

/** posicion de 'form' como palabra o expresión entera dentro de 'haystack', o -1. */
export function indexOfWord(haystack, form, from = 0) {
  if (!form) return -1
  for (let i = haystack.indexOf(form, from); i !== -1; i = haystack.indexOf(form, i + 1)) {
    const before = haystack[i - 1]
    const after = haystack[i + form.length]
    const startsWord = before === undefined || !WORD_CHAR.test(before)
    const endsWord = after === undefined || !WORD_CHAR.test(after)
    if (startsWord && endsWord) return i
  }
  return -1
}

/**
 * fichas cuyas formas aparecen en 'text' y se llegaron a escribir por completo
 * (la palabra termina antes de 'upTo'). Se devuelven en orden de aparición, sin repetir.
 */

export function findWords(text, upTo, entries) {
  const haystack = normalizeText(text)
  const hits = []

  for (const entry of entries) {
    let first = Infinity
    for (const form of entry.forms) {
      const normalized = normalizeText(form)
      const i = indexOfWord(haystack, normalized)
      if (i !== -1 && i + normalized.length <= upTo && i < first) first = i
    }
    if (first !== Infinity) hits.push({ entry, at: first })
  }

  return hits.sort((a, b) => a.at - b.at).map((hit) => hit.entry)
}

/** la primera frase del juego donde aparece la palabra, o null. */
export function exampleFor(entry, phrases = FRASES) {
  if (entry.example) return entry.example

  const forms = entry.forms.map(normalizeText)
  const found = phrases.find((phrase) => {
    const haystack = normalizeText(phrase)
    return forms.some((form) => indexOfWord(haystack, form) !== -1)
  })
  return found ?? null
}

/**
 * Fichas que pueden mostrarse: aptas para todo publico y revisadas.
 * Mientras se desarrolla se muestran también las que faltan revisar.
 */
export function publishableEntries(entries, showUnreviewed = import.meta.env.DEV) {
  return entries.filter((entry) => entry.allAges && (entry.reviewed || showUnreviewed))
}
