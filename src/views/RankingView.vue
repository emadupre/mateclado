<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import DurationPicker from '@/components/DurationPicker.vue'
import { useRanking } from '@/composables/useRanking'
import { DEFAULT_DURATION, DURATIONS } from '@/data/durations'

const route = useRoute()
const router = useRouter()

// la URL es la fuente de verdad: //ranking?d=60
const duration = computed(() => {
  const d = Number(route.query.d)
  return DURATIONS.includes(d) ? d : DEFAULT_DURATION
})

const { rows, loading, error, reload } = useRanking(duration)

function select(seconds) {
  router.replace({ query: { d: seconds } })
}

const PODIUM = ['gold', 'silver', 'bronze']
const podiumClass = (index) => (index < PODIUM.length ? `podium-${PODIUM[index]}` : '')
</script>

<template>
  <main class="ranking">
    <AppHeader>
      <DurationPicker :options="DURATIONS" :value="duration" @select="select" />
    </AppHeader>

    <h1 class="title">ranking · {{ duration }}s</h1>
    <p class="note">Se muestra la mejor marca de cada participante.</p>

    <p v-if="loading" class="state" role="status">cargando...</p>

    <div v-else-if="error" class="state">
      <p role="alert">{{ error }}</p>
      <button type="button" class="retry" @click="reload">reintentar</button>
    </div>

    <p v-else-if="rows.length === 0" class="state">
      Todavía no hay puntajes para {{ duration }}s. ¡Tenés que ser el primero!
    </p>

    <div v-else class="table-wrap">
      <table class="board">
        <caption class="sr-only">
          Mejores puntajes de
          {{
            duration
          }}
          segundos
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">apodo</th>
            <th scope="col" class="num">pts</th>
            <th scope="col" class="num">ppm</th>
            <th scope="col" class="num">prec.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.id" :class="podiumClass(i)">
            <td class="pos" :class="{ first: i === 0 }">{{ i + 1 }}</td>
            <td class="nick">{{ row.nickname }}</td>
            <td class="num strong">{{ row.score }}</td>
            <td class="num">{{ row.wpm }}</td>
            <td class="num">{{ row.accuracy }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <RouterLink to="/" class="text-link back">← volver a jugar</RouterLink>
  </main>
</template>

<style scoped>
.title {
  margin: 0 0 var(--space-4);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.state {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-dim);
}
.retry {
  min-height: 44px;
  padding: 0 var(--space-3);
  font-family: var(--font-mono);
  color: var(--accent);
  background: var(--surface);
  border: 1px solid var(--surface-2);
  border-radius: var(--radius-md);
  cursor: pointer;
}
.table-wrap {
  overflow-x: auto;
}
.board {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 15px;
}
.board th {
  padding: 0 var(--space-2) var(--space-2);
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  color: var(--text-dim);
  border-bottom: 1px solid var(--surface);
}
.board td {
  padding: 10px var(--space-2);
  border-bottom: 1px solid var(--surface);
}
.board .num {
  text-align: right;
}
.pos {
  width: 3em;
}

.nick {
  overflow-wrap: anywhere;
}
.strong {
  font-weight: 700;
  color: var(--accent);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9em;
  height: 1.9em;
  border-radius: 50%;
  font-weight: 700;
  color: var(--text-dim);
}

.podium-gold .badge {
  color: var(--bg);
  background: var(--medal-gold);
}

.podium-silver .badge {
  color: var(--bg);
  background: var(--medal-silver);
}

.podium-bronze .badge {
  color: var(--bg);
  background: var(--medal-bronze);
}

.board tr.podium-gold td {
  background: var(--medal-gold-soft);
}

.board tr.podium-silver td {
  background: var(--medal-silver-soft);
}

.board tr.podium-bronze td {
  background: var(--medal-bronze-soft);
}

.board tr[class*='podium-'] .nick {
  font-weight: 700;
}

.back {
  display: inline-block;
  margin-top: var(--space-5);
}
</style>
