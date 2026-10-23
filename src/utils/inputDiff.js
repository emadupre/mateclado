/**
 * Compara el valor anterior de un input con el nuevo y devuelve
 * cuántos backspaces hubo y qué caracteres se agregaron después.
 */
export function diffInput(previous, next) {
  const max = Math.min(previous.length, next.length)
  let common = 0
  while (common < max && previous[common] === next[common]) common++

  const added = next.slice(common)

  return {
    backspaces: previous.length - common,
    // `added` es un string: el spread lo convierte en un array de caracteres
    chars: [...added],
  }
}