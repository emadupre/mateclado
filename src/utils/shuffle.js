/**
 * Mezclamos un array con Fisher-Yates y devuelve una copia nueva.
 * El array original no lo modifica.
 * 'rng' es inyectable para poder testear con resultados predecibles.
 */
export function shuffle(items, rng = Math.random) {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
