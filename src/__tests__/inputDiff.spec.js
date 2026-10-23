import { describe, expect, it } from 'vitest'
import { diffInput } from '@/utils/inputDiff'

describe('diffInput', () => {
  it('detecta un carácter agregado', () => {
    expect(diffInput(' ', ' a')).toEqual({ backspaces: 0, chars: ['a'] })
  })

  it('detecta varios caracteres agregados', () => {
    expect(diffInput(' ', ' hol')).toEqual({ backspaces: 0, chars: ['h', 'o', 'l'] })
  })

  it('detecta un borrado', () => {
    expect(diffInput(' ab', ' a')).toEqual({ backspaces: 1, chars: [] })
  })

  it('borrar el relleno también cuenta como backspace', () => {
    expect(diffInput(' ', '')).toEqual({ backspaces: 1, chars: [] })
  })

  it('sin cambios no emite nada', () => {
    expect(diffInput(' ho', ' ho')).toEqual({ backspaces: 0, chars: [] })
  })

  it('un reemplazo son borrados más caracteres nuevos', () => {
    expect(diffInput(' hol', ' Hola')).toEqual({
      backspaces: 3,
      chars: ['H', 'o', 'l', 'a'],
    })
  })
})