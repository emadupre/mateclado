import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('muestra el titulo de la app', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('mateclado')
  })
})
