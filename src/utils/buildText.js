import { FRASES } from '@/data/frases'
import { shuffle } from './shuffle'

/**
 * Armamos un texto uniendo frases hasta alcanzar el 'minChars' caracteres.
 * Recorre todas las frases (pero mezcladas) antes de repetir ninguna, y evita que
 * la misma frase aparezca dos veces seguidas al volver a mezclar.
 */

export function buildText(minChars, { phrases = FRASES, rng = Math.random } = {}) {
  if (!phrases.length) {
    throw new Error('buildText necesita al menos una frase')
  }

  const parts = []
  let length = 0
  let pool = []
  let last = null

  while (length < minChars) {
    if (pool.length === 0) {
      pool = shuffle(phrases, rng)
      if (pool.length > 1 && pool[0] === last) {
        ;[pool[0], pool[1]] = [pool[1], pool[0]]
      }
    }
    const next = pool.shift()
    parts.push(next)
    length += next.length + (parts.length > 1 ? 1 : 0)
    last = next
  }

  return parts.join(' ')
}
