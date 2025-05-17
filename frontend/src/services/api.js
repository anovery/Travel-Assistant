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
  }
}

