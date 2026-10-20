export const POINTS_PER_WORD = 10
export const PENALTY_PER_ERROR = 2

/** Palabras por minuto: se considera que una palabra tiene 5 caract. */
export function calcWpm(correctChars, seconds) {
  if (seconds <= 0) return 0
  return Math.round(correctChars / 5 / (seconds / 60))
}

/** Porcentaje de caracteres correctos sobre el total tipeado. */
export function calcAccuracy(correctChars, totalTyped) {
  if (totalTyped <= 0) return 0
  return Math.round((correctChars / totalTyped) * 100)
}
