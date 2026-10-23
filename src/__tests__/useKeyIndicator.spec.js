import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { keyLabel, useKeyIndicator } from '@/composables/useKeyIndicator'

describe('keyLabel', () => {
  it('muestra las laetras en mayúscula', () => {
    expect(keyLabel('a')).toBe('A')
    expect(keyLabel('ñ')).toBe('Ñ')
  })

  it('usa simbolos para espacio y backspace', () => {
    expect(keyLabel(' ')).toBe('␣')
    expect(keyLabel('Backspace')).toBe('⌫')
  })

  it('deja los signos como están', () => {
    expect(keyLabel('¿')).toBe('¿')
  })
})

describe('useKeyIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('se activa al presionar y se apaga solo, conservando la última tecla', () => {
    const k = useKeyIndicator()
    k.press('h')
    expect(k.label.value).toBe('H')
    expect(k.active.value).toBe(true)

    vi.advanceTimersByTime(220)
    expect(k.active.value).toBe(false)
    expect(k.label.value).toBe('H')
  })

  it('una pulsación nueva reinicia la ventana de activación', () => {
    const k = useKeyIndicator()
    k.press('h')
    vi.advanceTimersByTime(150)
    k.press('o')
    vi.advanceTimersByTime(150)
    expect(k.active.value).toBe(true)

    vi.advanceTimersByTime(100)
    expect(k.active.value).toBe(false)
  })

  it('clear lo deja vacio', () => {
    const k = useKeyIndicator()
    k.press('h')
    k.clear()
    expect(k.label.value).toBe('')
    expect(k.active.value).toBe(false)
  })
})
