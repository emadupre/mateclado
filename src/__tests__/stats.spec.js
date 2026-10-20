import { describe, it, expect } from 'vitest'
import { calcAccuracy, calcWpm } from '@/utils/stats'

describe('calcWpm', () => {
  it('calcula palabras por minuto con palabras de 5 caracteres', () => {
    expect(calcWpm(50, 30)).toBe(20)
    expect(calcWpm(5, 60)).toBe(1)
  })

  it('devuelve 0 sin caracteres correctos o sin tiempo transcurrido', () => {
    expect(calcWpm(0, 30)).toBe(0)
    expect(calcWpm(10, 0)).toBe(0)
  })
})

describe('calcAccuracy', () => {
  it('calculca el porcentaje redondeado', () => {
    expect(calcAccuracy(3, 4)).toBe(75)
    expect(calcAccuracy(2, 3)).toBe(67)
    expect(calcAccuracy(10, 10)).toBe(100)
  })

  it('devuelve 0 si no se tipeó nada', () => {
    expect(calcAccuracy(0, 0)).toBe(0)
  })
})
