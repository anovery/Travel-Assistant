<template>
  <div>
    <!-- 您的应用布局 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import api from './services/api'

const savedSpots = ref([])

const fetchSavedSpots = async () => {
  try {
    const response = await api.getSavedSpots()
    savedSpots.value = response.data
  } catch (e) {}
}
const addSavedSpot = async (spot) => {
  await api.addSavedSpot(spot)
  await fetchSavedSpots()
}
const deleteSavedSpot = async (id) => {
  await api.deleteSavedSpot(id)
  savedSpots.value = savedSpots.value.filter(s => s.id !== id)
}

fetchSavedSpots()
provide('savedSpots', savedSpots)
provide('addSavedSpot', addSavedSpot)
provide('deleteSavedSpot', deleteSavedSpot)
</script>
