import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export default {
  getSavedSpots(userId = 1) {
    return apiClient.get('/saved_spots', { params: { user_id: userId } })
  },
  addSavedSpot(spot) {
    return apiClient.post('/saved_spots', spot)
  },
  deleteSavedSpot(spotId) {
  return apiClient.delete(`/saved_spots/${spotId}`)
  },
  getAiSuggestion(location) {
    return apiClient.post('/ai/suggest', { location })
  },
  // 交通相关API
  searchTransport(params) {
    return apiClient.post('/transport/search', params)
  },
  getSavedRoutes() {
    return apiClient.get('/saved_routes')
  },
  saveRoute(route) {
    return apiClient.post('/saved_routes', route)
  },
  deleteRoute(routeId) {
    return apiClient.delete(`/saved_routes/${routeId}`)
  }
}

