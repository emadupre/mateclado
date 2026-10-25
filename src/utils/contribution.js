import { REGION_VALUES } from '@/data/regions'
import { indexOfWord, normalizeText } from './glosario'
import { normalizeNickname, validateNickname } from './nickname'

//si cambiamos los limits tenemos que actualizar tambien las restriciones de la tabla'contributors'
export const LIMITS = {
  term: { min: 2, max: 40 },
  meaning: { min: 5, max: 300 },
  example: { min: 15, max: 140 },
  origin: { max: 300 },
  source: { max: 200 },
}

const TERM_CHARS = /^[\p{L}\p{N} '-]+$/u
// los mismos caracteres que permiten las frases del juego: tienen que poder tipearse
const TYPEABLE = /^[\p{L}\p{N} ,.;:¿?¡!'"()-]+$/u

const squash = (value) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

function lengthProblem(label, value, { min = 0, max }) {
  if (value.length < min) return `${label}: mínimo ${min} caracteres.`
  if (value.length > max) return `${label}: máximo ${max} caracteres.`
  return null
}

/**
 * Devuelve errors (un mensaje por campo, en el orden del formulario), y 'clean'
 * (los datos listos para guardar: sin espacios de más y con 'null' en lo opcional vacio)
 */
export function validateContribution(draft) {
  const clean = {
    term: squash(draft.term),
    region: String(draft.region ?? ''),
    meaning: squash(draft.meaning),
    example: squash(draft.example),
    origin: squash(draft.origin) || null,
    source: squash(draft.source) || null,
    contributor: normalizeNickname(draft.contributor) || null,
  }
  const errors = {}

  const termProblem = lengthProblem('Palabra', clean.term, LIMITS.term)
  if (termProblem) {
    errors.term = termProblem
  } else if (!TERM_CHARS.test(clean.term)) {
    errors.term = 'Palabra: usá solo letras, números, espacios, apóstrofes y guiones.'
  }

  if (!REGION_VALUES.includes(clean.region)) {
    errors.region = 'Elegí de dónde es la palabra.'
  }

  const meaningProblem = lengthProblem('Significado', clean.meaning, LIMITS.meaning)
  if (meaningProblem) errors.meaning = meaningProblem

  const exampleProblem = lengthProblem('Frase de ejemplo', clean.example, LIMITS.example)
  if (exampleProblem) {
    errors.example = exampleProblem
  } else if (!TYPEABLE.test(clean.example)) {
    errors.example =
      'Frase de ejemplo: usá solo letras, números y signos comunes (nada de emojis ni guiones largos).'
  } else if (
    !errors.term &&
    indexOfWord(normalizeText(clean.example), normalizeText(clean.term)) === -1
  ) {
    errors.example = 'La frase tiene que usar la palabra tal como la escribistee arriba.'
  }

  if (clean.origin) {
    const problem = lengthProblem('Origen', clean.origin, LIMITS.origin)
    if (problem) errors.origin = problem
  }

  if (clean.source) {
    const problem = lengthProblem('Fuente', clean.source, LIMITS.source)
    if (problem) errors.source = problem
  }

  if (clean.contributor) {
    const problem = validateNickname(clean.contributor)
    if (problem) errors.contributor = problem
  }

  return { errors, clean }
}
