export const NICKNAME_MIN = 2
export const NICKNAME_MAX = 20

const ALLOWED = /^[\p{L}\p{N} _.-]+$/u

export function normalizeNickname(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** devuelve mensaje de error en español, o null si el apodo es valido */
export function validateNickname(raw) {
  const nick = normalizeNickname(raw)
  if (nick.length < NICKNAME_MIN) {
    return `El apodo debe tener al menos ${NICKNAME_MIN} caracteres`
  }
  if (nick.length > NICKNAME_MAX) {
    return `El apodo puede tener hasta  ${NICKNAME_MAX} caracteres`
  }
  if (!ALLOWED.test(nick)) {
    return `Usá solo letras, números, espacios, guiones y puntos`
  }
  return null
}
