<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import WordCard from '@/components/WordCard.vue'
import { CATEGORIES, GLOSARIO } from '@/data/glosario'
import { REGION_OPTIONS } from '@/data/regions'
import { useCommunityStore } from '@/stores/community'
import {
  filterEntries,
  filtersToQuery,
  MAX_QUERY_LENGTH,
  readFilters,
  regionOptions,
  sortEntries,
} from '@/utils/dictionary'
import { publishableEntries } from '@/utils/glosario'

const route = useRoute()
const router = useRouter()

const community = useCommunityStore()
community.ensureLoaded()

const baseEntries = publishableEntries(GLOSARIO)
const entries = computed(() => sortEntries([...baseEntries, ...community.entries]))
const regions = computed(() => regionOptions(entries.value))
// solo los tipos que tienen al menos una palabra
const categories = computed(() =>
  Object.keys(CATEGORIES).filter((key) => entries.value.some((entry) => entry.category === key)),
)

const possible = {
  categories: Object.keys(CATEGORIES),
  regions: regionOptions(REGION_OPTIONS.map(({ value }) => ({ region: value }))),
}

const initial = readFilters(route.query, possible)
const query = ref(initial.query)
const category = ref(initial.category)
const region = ref(initial.region)

// la url refleja los filtros: así se puede compartir un enlace ya filtrado
watch([query, category, region], () => {
  router.replace({
    query: filtersToQuery({
      query: query.value,
      category: category.value,
      region: region.value,
    }),
  })
})

const results = computed(() =>
  filterEntries(entries.value, {
    query: query.value,
    category: category.value,
    region: region.value,
  }),
)

const hasFilters = computed(() => Boolean(query.value.trim() || category.value || region.value))

function clearFilters() {
  query.value = ''
  category.value = ''
  region.value = ''
}
</script>

<template>
  <main class="dictionary">
    <AppHeader />

    <h1 class="title">Diccionario</h1>
    <p class="intro">
      Palabras y expresiones del habla Argentina. Cada ficha cuenta qué significa y, cuando se sabe,
      de dónde viene.
    </p>
    <p class="contribute-link">
      <RouterLink to="/aportar" class="text-link"
        >¿Falta alguna palabra de tu zona? Aportá la tuya →</RouterLink
      >
    </p>

    <form class="filters" role="search" @submit.prevent>
      <div class="field grow">
        <label for="q">Buscar</label>
        <input
          type="search"
          id="q"
          v-model="query"
          placeholder="una palabra o un significado"
          autocomplete="off"
          enterkeyhint="search"
          :maxlength="MAX_QUERY_LENGTH"
        />
      </div>
      <div class="field">
        <label for="cat">Tipo</label>
        <select id="cat" v-model="category">
          <option value="">Todos</option>
          <option v-for="key in categories" :key="key" :value="key">{{ CATEGORIES[key] }}</option>
        </select>
      </div>
      <div class="field">
        <label for="reg">Lugar</label>
        <select id="reg" v-model="region">
          <option value="">Todos</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </form>

    <p class="count" role="status">{{ results.length }} de {{ entries.length }} palabras</p>
    <p v-if="community.status === 'loading'" class="note" role="status">
      Cargando palabras de la comunidad..
    </p>
    <p v-if="community.status === 'error'" class="note" role="status">
      No pudimos cargar las palabras de la comunidad.
    </p>

    <ul v-if="results.length" class="list">
      <li v-for="entry in results" :key="entry.id">
        <WordCard :entry="entry" :heading-level="2" />
      </li>
    </ul>

    <div v-else class="empty">
      <p>No encontramos ninguna palabra con esos filtros</p>
      <button v-if="hasFilters" type="button" class="clear" @click="clearFilters">
        limpiar filtros
      </button>
    </div>
  </main>
</template>

<style scoped>
.note {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}
.title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.intro {
  margin: 0 0 var(--space-4);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-dim);
}
.contribute-link {
  margin: 0 0 var(--space-4);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 140px;
}

.field.grow {
  flex: 1 1 220px;
}

label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}

input,
select {
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-size: 16px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
}
input::placeholder {
  color: var(--text-faint);
}

.count {
  margin: 0 0 var(--space-2);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-dim);
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.empty {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-dim);
}
.clear {
  min-height: 44px;
  padding: 0 var(--space-3);
  font-family: var(--font-mono);
  color: var(--accent);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
