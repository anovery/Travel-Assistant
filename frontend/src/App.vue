<template>
  <div class="app-wrapper">
    <div class="central-container">
      <div class="app-container">
        <Sidebar />
        <div class="content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import api from './services/api'
import { ref, provide } from 'vue'

export default {
  components: {
    Sidebar
  },
  setup() {
    const savedSpots = ref([])
    
    // 提供savedSpots数据给所有子组件
    provide('savedSpots', savedSpots)
    
    // 定义更新savedSpots的方法并提供给子组件
    const updateSavedSpots = async () => {
      try {
        const response = await api.getSavedSpots()
        savedSpots.value = response.data
      } catch (error) {
        console.error('获取收藏景点失败:', error)
      }
    }
    
    provide('updateSavedSpots', updateSavedSpots)
    
    // 初始化时获取数据
    updateSavedSpots()
    
    return {}
  }
}
</script>

<style>
/* 全局重置 */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color:rgb(228, 233, 242); /* 添加背景色作为衬托 */
}

/* 最外层包装 */
.app-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

/* 中央容器 */
.central-container {
  width: 90%;
  height: 90%;
  min-width: 1024px; /* 最小宽度保证内容不挤压 */
  max-width: 1600px; /* 最大宽度避免在大屏幕上过宽 */
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
}

/* 应用主容器 */
.app-container {
  display: flex;
  width: 100%;
  height: 100%;
}


/* 内容区 */
.content {
  flex: 1;
  padding: 24px;
  background-color: rgb(255, 255, 255);
  overflow-y: auto;
}
</style>