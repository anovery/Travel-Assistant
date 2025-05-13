import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Plan from './components/Plan.vue'
import Weather from './components/Weather.vue'
import Luggage from './components/Luggage.vue'
import Transport from './components/Transport.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/plan', component: Plan },
  { path: '/weather', component: Weather },
  { path: '/luggage', component: Luggage },
  { path: '/transport', component: Transport }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
