import { describe, it, expect } from 'vitest'
import { shuffle } from '@/utils/shuffle'

describe('shuffle', () => {
  it('devuelve los mismos elementos, en cualquier orden', () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffle(original)
    expect(result).toHaveLength(original.length)
    expect([...result].sort()).toEqual(original)
  })

  it('no modifica el array original', () => {
    const original = [1, 2, 3, 4]
    shuffle(original)
    expect(original).toEqual([1, 2, 3, 4])
  })

  it('es predecible con un generador fijo', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1])
  })

  it('maneja un array vacio', () => {
    expect(shuffle([])).toEqual([])
  })
})
