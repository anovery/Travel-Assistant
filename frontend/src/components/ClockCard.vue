<template>
  <div class="tool-card clock-card">
    <img src="https://img.icons8.com/ios-filled/50/clock.png" class="clock-icon" />
    <p class="time">{{ time }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { time: '' }
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }
}
</script>

<style scoped>
.clock-card {
  width: 180px;
  background: linear-gradient(135deg, #ffe8d4, #fff2e1);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.2s ease;
}

.clock-card:hover {
  transform: scale(1.03);
}

.clock-icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  animation: rotateClock 10s linear infinite;
}

.time {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
}

@keyframes rotateClock {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
