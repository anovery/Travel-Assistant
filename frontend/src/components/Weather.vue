<template>
  <div class="weather-wrapper">
    <!-- 时间输入卡片 -->
    <div class="tool-card input-card">
      <h1>天气查询</h1>
      <div class="input-group">
        <label>开始时间</label>
        <input type="date" v-model="startDate" />
      </div>
      <div class="input-group">
        <label>结束时间</label>
        <input type="date" v-model="endDate" />
      </div>
      <button @click="fetchWeather">查询</button>
    </div>

    <!-- 天气展示卡片 -->
    <div class="tool-card result-card" v-if="weatherResult">
      <h3>🌤 天气预测</h3>
      <ul>
        <li v-for="(item, index) in weatherResult" :key="index">
          📆 <strong>{{ item.date }}</strong>：{{ item.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      weatherResult: null
    }
  },
  methods: {
    async fetchWeather() {
      if (!this.startDate || !this.endDate) {
        alert("请输入完整的时间范围")
        return
      }
      try {
        const response = await fetch('http://localhost:5000/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_date: this.startDate,
            end_date: this.endDate
          })
        })
        const data = await response.json()
        this.weatherResult = data.forecast
      } catch (error) {
        alert("获取天气失败")
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.weather-wrapper {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 32px;
}

.tool-card {
  background:rgb(255, 255, 255);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  width: 800px;
  transition: transform 0.2s ease;
}
.tool-card:hover {
  transform: translateY(-4px);
}

.tool-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.input-group input {
  width: 50%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  font-size: 14px;
  transition: border 0.2s;
}
.input-group input:focus {
  border-color: #00bfff;
  outline: none;
}

.input-card button {
  width: 30%;
  padding: 12px;
  background: linear-gradient(to right, #00bfff, #1e90ff);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}
.input-card button:hover {
  background: linear-gradient(to right, #0099cc, #1c86ee);
}

.result-card ul {
  list-style: none;
  padding: 0;
}

.result-card li {
  font-size: 15px;
  color: #333;
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
}
</style>
