import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/ranking',
      name: 'ranking',
      //carga perezosa: este codigo se descarga recien al entrar al ranking
      component: () => import('../views/RankingView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
    {
      path: '/diccionario',
      name: 'dictonary',
      component: () => import('../views/DictionaryView.vue'),
    },
    {
      path: '/aportar',
      name: 'contribute',
      component: () => import('../views/ContributeView.vue'),
    },
  ],
})

export default router
