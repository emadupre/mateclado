import { describe, expect, it } from 'vitest'
import { normalizeNickname, validateNickname } from '../utils/nickname'

describe('normalizeNickname', () => {
  it('saca espacios sobrantes', () => {
    expect(normalizeNickname('  Ema   Gómez ')).toBe('Ema Gómez')
  })

  it('tolera valores vacíos', () => {
    expect(normalizeNickname(null)).toBe('')
    expect(normalizeNickname(undefined)).toBe('')
  })
})

describe('validateNickname', () => {
  it('acepta apodos con tildes, ñ, números y símbolos permitidos', () => {
    expect(validateNickname('Ema')).toBeNull()
    expect(validateNickname('Ñandú_99')).toBeNull()
    expect(validateNickname('José-María')).toBeNull()
  })

  it('rechaza apodos muy cortos', () => {
    expect(validateNickname('a')).toMatch(/al menos 2/)
    expect(validateNickname('   ')).toMatch(/al menos 2/)
  })

  it('rechaza apodos muy largos', () => {
    expect(validateNickname('x'.repeat(21))).toMatch(/hasta 20/)
  })

  it('rechaza caracteres no permitidos', () => {
    expect(validateNickname('<script>')).toMatch(/solo letras/)
    expect(validateNickname('hola😀')).toMatch(/solo letras/)
  })
})
