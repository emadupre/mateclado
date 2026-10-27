import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { GLOSARIO } from '@/data/glosario'
import { fetchApprovedContributions } from '@/services/contributions'
import { entriesFromRows } from '@/utils/community'

const blocked = GLOSARIO.filter((entry) => !entry.allAges)

export const useCommunityStore = defineStore('community', () => {
  const entries = ref([])
  const status = ref('idle')
  let pending = null

  const phrases = computed(() => entries.value.map((entry) => entry.example))

  async function load() {
    status.value = 'loading'
    try {
      const rows = await fetchApprovedContributions()
      const kept = entriesFromRows(rows, blocked)
      const dropped = (Array.isArray(rows) ? rows.length : 0) - kept.length
      if (dropped > 0) {
        console.warn(`${dropped} aporte(s) aprobado(s) no cumplen las reglas y se ignoraron.`)
      }
      entries.value = kept
      status.value = 'ready'
    } catch {
      status.value = 'error'
      pending = null
    }
  }

  function ensureLoaded() {
    if (!pending) pending = load()
    return pending
  }

  return { entries, phrases, status, ensureLoaded }
})
