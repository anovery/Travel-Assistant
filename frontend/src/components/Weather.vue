<template>
  <div class="weather-wrapper">
    <h1 class="main-title">天气查询</h1>

    <div class="content-panels">
      <div class="left-panel">
        <div class="tool-card input-card">
          <h1>📍🗓️ 地点时间</h1>
          <div class="input-group">
            <label for="location">地点</label>
            <input type="text" id="location" v-model="location" placeholder="例如：北京, 上海" />
          </div>
          <div class="date-inputs">
            <div class="input-group">
              <label for="startDate">开始时间</label>
              <input type="date" id="startDate" v-model="startDate" />
            </div>
            <div class="input-group">
              <label for="endDate">结束时间</label>
              <input type="date" id="endDate" v-model="endDate" />
            </div>
          </div>
          <button @click="fetchWeather">查询天气</button>
        </div>

        <div class="tool-card result-card">
          <h3>🧳 Kimi 出行建议</h3>
          <div class="scroll-content">
            <p v-if="isAdviceLoading" class="placeholder-text" style="color: #388e3c; font-weight: bold;">
              天气已获取，正在为您生成出行建议...
            </p>
            <p v-else-if="travelAdvice" v-html="formattedAdvice"></p>
            <p v-else class="placeholder-text">查询天气后，这里会显示您的出行建议。</p>
            </div>
        </div>
      </div> <div class="tool-card weather-display">
        <h3>🌤 天气预测</h3>
        <p v-if="isWeatherLoading" style="color: #d32f2f; font-weight: bold;">正在为你更新天气信息...</p>
        <ul v-else-if="weatherResult && weatherResult.length">
          <li v-for="(item, index) in weatherResult" :key="index">
            📆 <strong>{{ formatTime(item.time) }}</strong><br />
            🌡 温度：{{ item.temperature }}°C，
            💧湿度：{{ item.humidity }}%，
            ☔️降水概率：{{ item.precipitationProbability }}%<br />
            📝 天气：{{ getWeatherDescription(item.weatherCode) }}
          </li>
        </ul>
        <p v-else class="placeholder-text">选择地点和时间，然后点击查询以查看天气预测。</p>
      </div> 
      </div> 
      </div> 
      </template>

<script>
export default {
  data() {
    return {
      location: '',
      startDate: '',
      endDate: '',
      weatherResult: [],
      travelAdvice: '',
      isWeatherLoading: false, // 控制“天气加载”提示
      isAdviceLoading: false   // 控制“建议加载”提示
    }
  },
  computed: {
    // 将换行符\n替换为HTML的<br>标签，以便正确显示
    formattedAdvice() {
      // 增加一个检查，确保 travelAdvice 是一个字符串
      if (typeof this.travelAdvice === 'string') {
        return this.travelAdvice.replace(/\n/g, '<br />');
      }
      return '';
    }
  },
  methods: {
    async fetchWeather() {
      // 1. 前端输入校验 (这部分保持不变)
      if (!this.startDate || !this.endDate || !this.location) {
        alert("请输入完整的查询信息");
        return;
      }
      if (new Date(this.endDate) < new Date(this.startDate)) {
        alert("结束时间不能早于开始时间，请输入规范的时间范围！");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(this.startDate) < today || new Date(this.endDate) < today) {
        alert("无法查询过去时间段，请重新输入");
        return;
      }

      // 2. 重置状态和数据
      this.isWeatherLoading = true;
      this.isAdviceLoading = false; // 每次查询都重置建议加载状态
      this.weatherResult = [];
      this.travelAdvice = '';

      // 3. 调用后端API
      try {
        const response = await fetch('http://localhost:5000/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_date: this.startDate,
            end_date: this.endDate,
            location: this.location
          })
        });

        // 天气API有响应后，立即关闭天气加载提示
        this.isWeatherLoading = false;

        // START: 新增 - 处理后端返回的错误（包括无效地址）
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === 'INVALID_LOCATION') {
            alert("请输入规范的地点信息"); // 这里处理无效地址
          } else {
            alert(errorData.error || "获取天气失败，请稍后再试");
          }
          return; // 发现错误，停止执行
        }
        // END: 新增结束
        
        // 5. 处理成功的数据
        const data = await response.json();
        if (data.weather && data.weather.length > 0) {
          this.weatherResult = data.weather;
          this.fetchAdvice(); // 天气获取成功，才去获取建议
        } else {
          // 成功但天气数据为空，也视为一种无效地址的情况
          alert("无法获取该地点的天气信息，请检查地点名称是否正确");
          this.weatherResult = [];
        }

      } catch (error) {
        // 处理网络请求本身的失败 (如服务器关闭)
        this.isWeatherLoading = false;
        alert("网络请求失败，请检查服务是否运行");
        console.error(error);
      }
    },

    async fetchAdvice() {
      this.isAdviceLoading = true; // START: 新增 - 开启“正在生成建议”提示
      try {
        const response = await fetch('http://localhost:5000/api/advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weather: this.weatherResult })
        });
        
        if (!response.ok) {
           const errData = await response.json();
           throw new Error(errData.error || "建议服务出错");
        }

        const data = await response.json();
        this.travelAdvice = data.advice;
      } catch (err) {
        console.error("获取出行建议失败", err);
        this.travelAdvice = `抱歉，无法生成出行建议。\n错误: ${err.message}`;
      } finally {
        this.isAdviceLoading = false; // END: 新增 - 无论成功或失败，最后都关闭提示
      }
    },

    formatTime(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getWeatherDescription(code) {
      const weatherCodeMap = {
        1000: '晴朗',
        1001: '多云',
        1100: '多云',
        1101: '部分多云',
        1102: '阴天',
        2000: '有雾',
        2100: '轻雾',
        4000: '小雨',
        4001: '雨',
        4200: '零星小雨',
        4201: '暴雨',
        5000: '小雪',
        5001: '雪',
        5100: '阵雪',
        5101: '雪',
        8000: '雷暴',
      };
      return weatherCodeMap[code] || '未知天气';
    }
  }
}
</script>

<style scoped>
/* Base Styles */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f4f8; 
  color: #333;
}

.weather-wrapper {
  display: flex;
  flex-direction: column; 
  gap: 24px;
  padding: 22px 32px 32px 32px; 
  align-items: center; 
  box-sizing: border-box;
}

.main-title {
  font-size: 42px; 
  font-weight: 800;
  color: #2c3e50; 
  margin-top: 0; 
  margin-bottom: 25px; 
  text-align: center;
  width: 100%; 
}

.content-panels {
  display: flex;
  gap: 24px;
  align-items: stretch;
  width: 100%; 
  justify-content: center; 
  flex-grow: 1; 
}


.left-panel {
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 22px - 32px - 42px - 25px); 
}

/* --- Tool Card General Styles --- */
.tool-card {
  border-radius: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: 30px; /* Base padding for cards */
  transition: all 0.3s ease-in-out;
}

.tool-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.tool-card h1 {
  /* This style specifically for input-card h1 (now "地点时间") */
  font-size: 22px; /* Matching h3 size for "出行建议" */
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-card h3 {
  font-size: 22px; /* Base size for h3 headings */
  font-weight: 600;
  margin-bottom: 18px;
  color: #2980b9;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* --- Input Card Specific Styles (Weather Query) --- */
.input-card {
  flex-shrink: 0;
  height: 240px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  background: linear-gradient(135deg, #a7e0e3, #69d1d4); /* Morandi Turquoise */
  justify-content: center;
  align-items: center;
}

.input-card h1 {
 
  font-weight: 700; 
  margin-bottom: 12px;
  text-align: center;
  color: #006064; 
  justify-content: center;
}

.input-group {
  margin-bottom: 8px;
  text-align: center;
  width: 100%;
}

.input-group label {
  font-size: 13px;
  margin-bottom: 3px;
  display: block;
  color: #00796b;
}

.input-group input {
  padding: 6px 8px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid #4db6ac;
  background-color: #e0f2f1;
  text-align: center;
}

.date-inputs {
  display: flex;
  justify-content: center;
  gap: 10px; /* 1cm gap */
  width: calc(100% - 20px);
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 8px;
}

.date-inputs .input-group {
  flex: 1;
  margin-bottom: 0;
  text-align: center;
}

.date-inputs input {
  width: calc(100% - 16px);
}


.input-card button {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  margin-top: auto;
  background: linear-gradient(to right, #4a90e2, #2e78c0);
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
  box-shadow: 0 4px 10px rgba(74, 144, 226, 0.2);
}

.input-card button:hover {
  background: linear-gradient(to right, #2e78c0, #4a90e2);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(74, 144, 226, 0.3);
}


/* --- Result Card Specific Styles (Travel Advice) --- */
.result-card {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 20px 25px;
  background: linear-gradient(135deg, #e6f7e8, #c8e6c9); /* Morandi Green */

  /* Scrollbar to the left */
  direction: rtl;
}

.result-card .scroll-content {
  direction: ltr;
  width: 100%;
}


.result-card h3 {
  font-size: 22px; /* Set as base for h3 headings */
  margin-bottom: 15px;
  color: #388e3c;
}

.result-card p {
  line-height: 1.6;
  color: #555;
  font-size: 14px;
  width: 100%;
  text-align: left;
}

/* --- Weather Display Specific Styles --- */
.weather-display {
  flex: 1.0;
  /* Re-calculate height based on new overall padding and title size/margins */
  height: calc(100vh - 22px - 32px - 42px - 25px); /* total wrapper padding (top+bottom) - title height - title bottom margin */
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  padding: 20px 25px;
  background: linear-gradient(135deg, #fce6e6, #f2c7c7); /* Morandi Red */
}

.weather-display h3 {
  font-size: 22px; /* Set as base for h3 headings */
  margin-bottom: 15px;
  color: #d32f2f;
}

.weather-display ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.weather-display li {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(117, 39, 39, 0.5);
  border-radius: 15px;
  padding: 10px 15px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.weather-display li:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.weather-display li strong {
  color: #2e6db0;
  font-size: 15px;
}

/* Placeholder text style */
.placeholder-text {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 20px;
  width: 100%;
}
</style>
