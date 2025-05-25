#这是我的模块
<template>
  <div class="container">

    <!-- 小红书搜索模块 -->
    <section class="search-section">
      <div class="search-card">
        <h2 class="section-title">“小红书”一下</h2>
        <p class="section-description">探索热门景点与隐藏宝藏</p>
        <SearchBox />
      </div>
    </section>

    <!-- 下方模块布局：左侧为 添加+收藏，右侧为AI推荐 -->
    <section class="action-section combined-layout">

      <!-- 左侧：添加 + 收藏模块 -->
      <div class="left-panel">
        <div class="action-card">
          <div class="card-header">
            <i class="icon fas fa-plus-circle"></i>
            <h2 class="section-title">添加景点</h2>
          </div>
          <div class="input-group">
            <input
              v-model="newSpotName"
              type="text"
              placeholder="输入景点名称"
              class="styled-input"
              @keyup.enter="addSpot"
            />
            <button @click="addSpot" class="primary-button">
              <i class="fas fa-plus"></i> 添加
            </button>
          </div>
        </div>

        <!-- 收藏模块 -->
        <div class="saved-spots">

          <div v-if="savedSpots.length > 0" class="spot-list">
            <div v-for="spot in savedSpots" :key="spot.id" class="spot-item">
              <div class="spot-info">
                <i class="fas fa-map-marker-alt spot-icon"></i>
                <span class="spot-name">{{ spot.name }}</span>
              </div>
              <button @click="removeSpot(spot.id)" class="remove-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="far fa-compass empty-icon"></i>
            <p>暂无收藏景点</p>
            <p class="empty-hint">添加您想去的景点开始您的旅行计划吧</p>
          </div>
        </div>
      </div>

      <!-- 右侧：AI 推荐模块 -->
      <div class="right-panel action-card">
        <div class="card-header">
          <i class="icon fas fa-robot"></i>
          <h2 class="section-title">AI景点助手</h2>
        </div>
        <div class="input-group">
          <input
            v-model="locationInput"
            type="text"
            placeholder="输入想去的城市"
            class="styled-input"
            @keyup.enter="getAiSuggestion"
          />
          <button @click="getAiSuggestion" class="primary-button">
            <i class="fas fa-magic"></i> 
          </button>
        </div>
        
        <!-- 显示加载动画 -->
        <div v-if="loading" class="ai-suggestion loading-spinner">
          <i class="fas fa-spinner fa-spin"></i> 正在为您生成推荐...
        </div>

        <!-- 显示 AI 推荐结果 -->
        <div class="ai-suggestion" v-if="!loading && aiSuggestion">
          <h3 class="suggestion-title">✨ AI推荐：</h3>
          <p class="suggestion-content" style="white-space: pre-line; text-align: left;">
            {{ aiSuggestion }}
          </p>
        </div>

      </div>

    </section>
  </div>
</template>


<script>
import SearchBox from './SearchBox.vue'
import api from '../services/api'
import { inject } from 'vue'

export default {
  components: {
    SearchBox
  },
  setup() {
    // 注入提供的savedSpots引用和更新方法
    const savedSpots = inject('savedSpots')
    const updateSavedSpots = inject('updateSavedSpots')
    
    return { updateSavedSpots }
  },
  data() {
    return {
      savedSpots: [],
      newSpotName: '',
      locationInput: '',
      aiSuggestion: '',
      loading: false
    }
  },
  async created() {
    await this.fetchSavedSpots()
  },
  methods: {
    async fetchSavedSpots() {
      try {
        // 使用App.vue提供的更新方法
        await this.updateSavedSpots()
        
        // 从api获取数据以保持原有功能
        const response = await api.getSavedSpots()
        this.savedSpots = response.data
      } catch (error) {
        console.error('获取收藏景点失败:', error)
      }
    },
    async addSpot() {
      console.log('addSpot called');
      if (!this.newSpotName.trim()) {
        alert('请输入景点名称')
        return
      }
      try {
        console.log('即将调用api.addSavedSpot', this.newSpotName);
        await api.addSavedSpot({ name: this.newSpotName })
        this.newSpotName = ''
        await this.fetchSavedSpots()
      } catch (error) {
        console.error('添加景点失败:', error)
      }
    },
    async removeSpot(spotId) {
      try {
        await api.deleteSavedSpot(spotId)
        this.savedSpots = this.savedSpots.filter(spot => spot.id !== spotId)
        // 更新共享的savedSpots数据
        await this.updateSavedSpots()
      } catch (error) {
        console.error('删除景点失败:', error)
      }
    },
    async getAiSuggestion() {
      if (!this.locationInput.trim()) {
        alert('请输入您的位置')
        return
      }

      this.loading = true
      this.aiSuggestion = '' // 清空旧推荐

      try {
        const response = await api.getAiSuggestion(this.locationInput)
        this.aiSuggestion = response.data.suggestion
      } catch (error) {
        console.error('获取AI推荐失败:', error)
        this.aiSuggestion = '获取推荐失败，请稍后重试'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

:root {
  --primary-color: #FF4D6D;
  --secondary-color: #6C63FF;
  --accent-color: #4CC9F0;
  --text-color: #333333;
  --light-text: #666666;
  --background-color: #F8F9FA;
  --card-bg: #FFFFFF;
  --shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  --border-radius: 16px;
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Noto Sans SC', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
  background:rgb(84, 139, 191);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.1rem;
  color: var(--light-text);
  font-weight: 300;
}

/* 卡片通用样式 */
.search-card, .action-card, .saved-spots {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 30px;
  margin-bottom: 30px;
  transition: var(--transition);
}

.search-card:hover, .action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
}

/* 搜索区域 */
.search-section {
  margin-bottom: 40px;
}

.search-card {
  text-align: center;
}

/* 操作区域 */
.action-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.icon {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-right: 12px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0;
}

.section-description {
  color: var(--light-text);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

/* 输入框和按钮样式 */
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.styled-input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  outline: none;
}

.styled-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(76, 201, 240, 0.2);
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-button:hover {
  background-color: #FF3355;
  transform: translateY(-2px);
}

/* AI 建议区域 */
.ai-suggestion {
  background: rgba(76, 201, 240, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  border-left: 4px solid var(--accent-color);
}

.suggestion-title {
  color: var(--accent-color);
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.suggestion-content {
  color: var(--text-color);
  line-height: 1.7;
}

/* 收藏景点区域 */
.saved-spots {
  padding: 30px;
}

.spot-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.spot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: var(--transition);
}

.spot-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.spot-info {
  display: flex;
  align-items: center;
}

.spot-icon {
  color: var(--secondary-color);
  margin-right: 12px;
  font-size: 1.1rem;
}

.spot-name {
  font-weight: 500;
}

.remove-button {
  background: none;
  border: none;
  color: #FF6B6B;
  font-size: 1.1rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.remove-button:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #FF4D4D;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--light-text);
}

.empty-icon {
  font-size: 3rem;
  color: #DEE2E6;
  margin-bottom: 20px;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 10px;
  color: #ADB5BD;
}

.combined-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: flex-start;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.right-panel {
  align-self: start;
}

.loading-spinner {
  color: var(--accent-color);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.loading-spinner i {
  font-size: 1.2rem;
}


</style>