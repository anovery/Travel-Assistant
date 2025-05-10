<template>
  <div>
    <h2>{{ message }}</h2>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Greeting',
  data() {
    return {
      message: 'Loading...'
    }
  },
  mounted() {
    axios.get('http://localhost:5000/api/greeting')
      .then(res => this.message = res.data.message)
      .catch(err => {
        this.message = 'Failed to fetch message'
        console.error(err)
      })
  }
}
</script>
