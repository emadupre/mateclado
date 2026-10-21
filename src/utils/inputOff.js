/**
 * Comparamos el valor anterior de un input con el nuevo y devuelve cuantos backspaces hubo y qué carac. se agregaron desps.
 */

export function diffInput(previous, next) {
  const max = Math.min(previous.length, next.length)
  let common = 0
  while (common < max && previous[common] === next[common]) common++

  return {
    backspaces: previous.length - common,
    chars: next.slice(common),
  }
}
