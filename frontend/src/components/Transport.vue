<template>
  <div class="container">
    <h1 class="page-title">交通查询</h1>
    
    <!-- 输入表单区域 -->
    <div class="search-form">
      <div class="form-row">
        <div class="form-group">
          <label for="city">城市</label>
          <input 
            id="city" 
            v-model="city" 
            type="text" 
            class="form-control" 
            placeholder="请输入城市"
          />
        </div>
        
        <div class="form-group time-picker">
          <label>出行时间</label>
          <div class="time-input-wrapper">
            <input 
              v-model="departureTime" 
              type="text" 
              class="form-control" 
              placeholder="HH:MM" 
              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
              @blur="validateTime"
            />
            <i class="fas fa-clock"></i>
          </div>
          <span v-if="timeError" class="error-text">{{ timeError }}</span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group location-group">
          <label for="origin">起点</label>
          <div class="location-input-wrapper">
            <input 
              id="origin" 
              v-model="origin" 
              type="text" 
              class="form-control" 
              placeholder="请输入起点"
              @focus="showSpotDropdown('origin')"
              @blur="hideOriginSpots"
            />
            <div v-if="showOriginSpots && savedSpots && savedSpots.length > 0" class="spots-dropdown">
              <div 
                v-for="spot in savedSpots" 
                :key="spot.id" 
                class="spot-item"
                @click="selectSpot('origin', spot.name)"
              >
                <i class="fas fa-map-marker-alt"></i> {{ spot.name }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group location-group">
          <label for="destination">终点</label>
          <div class="location-input-wrapper">
            <input 
              id="destination" 
              v-model="destination" 
              type="text" 
              class="form-control" 
              placeholder="请输入终点"
              @focus="showSpotDropdown('destination')"
              @blur="hideDestSpots"
            />
            <div v-if="showDestSpots && savedSpots && savedSpots.length > 0" class="spots-dropdown">
              <div 
                v-for="spot in savedSpots" 
                :key="spot.id" 
                class="spot-item"
                @click="selectSpot('destination', spot.name)"
              >
                <i class="fas fa-map-marker-alt"></i> {{ spot.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="searchRoutes" class="search-button">
        <i class="fas fa-search"></i> 查询路线
      </button>
    </div>
    
    <!-- 查询路线加载动画 -->
    <div v-if="loading" class="ai-suggestion loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> 正在为您查询路线...
    </div>

    <!-- 结果展示区域 -->
    <div v-if="routes" class="results-container">
      <!-- 左侧路线选项 -->
      <div class="routes-panel">
        <div 
          v-for="(route, type) in routes" 
          :key="type" 
          class="route-option"
          :class="{ active: selectedRoute === type, disabled: route.status === 'error' }"
          @click="route.status === 'success' && selectRoute(type)"
        >
          <div class="route-icon">
            <i :class="getRouteIcon(type)"></i>
          </div>
          <div class="route-info">
            <div class="route-type">{{ getRouteTypeName(type) }}</div>
            <div v-if="route.status === 'success'" class="route-details">
              <span>{{ route.duration }} 分钟</span>
              <span>{{ route.distance.toFixed(1) }} 公里</span>
            </div>
            <div v-else class="route-error">
              {{ route.message }}
            </div>
          </div>
          <div v-if="route.status === 'success'" class="route-actions">
            <button 
              class="save-button" 
              @click.stop="saveCurrentRoute(type)"
              :disabled="isSaving"
            >
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 右侧地图 -->
      <div class="map-container" ref="mapContainer"></div>
    </div>
    
    <!-- 已保存的路线 -->
    <div class="saved-routes-container">
      <h2 class="section-title">
        <i class="fas fa-bookmark"></i> 已保存的路线
      </h2>
      
      <div v-if="savedRoutes.length > 0" class="saved-routes-list">
        <div 
          v-for="route in savedRoutes" 
          :key="route.id" 
          class="saved-route-item"
        >
          <div class="route-summary">
            <div class="route-icon">
              <i :class="getRouteIcon(route.type)"></i>
            </div>
            <div class="route-info">
              <div class="route-title">{{ route.origin }} → {{ route.destination }}</div>
              <div class="route-subtitle">
                <span>{{ getRouteTypeName(route.type) }}</span>
                <span>{{ route.duration }} 分钟</span>
                <span>{{ route.distance }} 公里</span>
              </div>
            </div>
          </div>
          <button @click="deleteRoute(route.id)" class="delete-button">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-route empty-icon"></i>
        <p>暂无保存的路线</p>
        <p class="empty-hint">通过搜索并保存路线开始规划您的旅行</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import MapService from '../services/MapService'
import RouteUtils from '../utils/RouteUtils'
import '../assets/styles/transport.css'
import { inject } from 'vue';

export default {
  setup() {
    // 注入提供的savedSpots引用
    const savedSpots = inject('savedSpots', []);
    return { savedSpots };
  },
  data() {
    return {
      // 输入参数
      city: '',
      origin: '',
      destination: '',
      departureTime: '',
      timeError: '',
      
      // 景点选择
      showOriginSpots: false,
      showDestSpots: false,
      
      // 路线数据
      routes: null,
      selectedRoute: null,
      
      // 保存的路线
      savedRoutes: [],
      isSaving: false,
      
      // 地图服务实例
      mapService: null,
      
      // 加载动画
      loading: false
    }
  },
  async created() {
    await this.fetchSavedRoutes()
    
    // 创建地图服务实例
    this.mapService = new MapService();
  },
  mounted() {
    // 配置高德地图安全设置
    if (window._AMapSecurityConfig === undefined) {
      window._AMapSecurityConfig = {
        serviceHost: 'http://localhost:5000/_AMapService',
      }
    }
    
    // 使用 $nextTick 确保DOM已经渲染后再执行地图初始化
    this.$nextTick(() => {
      // 添加小延迟以确保DOM元素完全可用
      setTimeout(() => {
        // 只有需要显示地图时才初始化
        if (this.routes) {
          this.initMap();
        }
      }, 300);
    });
  },
  methods: {
    showSpotDropdown(type) {
      if (type === 'origin') this.showOriginSpots = true;
      else this.showDestSpots = true;
    },
    // 修复: 使用方法替代template中的setTimeout 并增加延迟确保点击事件能触发
    hideOriginSpots() {
      setTimeout(() => { this.showOriginSpots = false; }, 200);
    },
    
    hideDestSpots() {
      setTimeout(() => { this.showDestSpots = false; }, 200);
    },
    
    // 初始化地图
    async initMap() {
      try {
        await this.mapService.initMap(this.$refs.mapContainer);
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    },
    
    // 获取保存的路线
    async fetchSavedRoutes() {
      try {
        const response = await api.getSavedRoutes()
        this.savedRoutes = response.data
      } catch (error) {
        console.error('获取保存的路线失败:', error)
      }
    },
    
    // 选择已保存的景点
    selectSpot(type, name) {
      if (type === 'origin') {
        this.origin = name
        this.showOriginSpots = false
      } else {
        this.destination = name
        this.showDestSpots = false
      }
    },
    
    // 验证时间格式
    validateTime() {
      if (!this.departureTime) {
        this.timeError = ''
        return true
      }
      
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
      if (!timeRegex.test(this.departureTime)) {
        this.timeError = '请输入有效的时间格式 (HH:MM)'
        return false
      }
      
      this.timeError = ''
      return true
    },
    
    // 获取交通方式的图标
    getRouteIcon(type) {
      return RouteUtils.getRouteIcon(type);
    },
    
    // 获取交通方式的名称
    getRouteTypeName(type) {
      return RouteUtils.getRouteTypeName(type);
    },
    
    // 查询路线
    async searchRoutes() {
      if (!this.city || !this.origin || !this.destination) {
        alert('请填写完整的城市、起点和终点信息')
        return
      }
      
      if (this.departureTime && !this.validateTime()) {
        return
      }
      
      this.loading = true;
      try {
        const response = await api.searchTransport({
          city: this.city,
          origin: this.origin,
          destination: this.destination,
          departureTime: this.departureTime
        })
        
        this.routes = response.data
        
        // 选择第一个可用的路线
        for (const type in this.routes) {
          if (this.routes[type].status === 'success') {
            // 初始化地图，然后选择路线
            await this.initMap();
            this.selectRoute(type);
            break
          }
        }
      } catch (error) {
        console.error('查询路线失败', error)
        alert('查询路线失败，请重试')
      } finally {
        this.loading = false;
      }
    },
    
    // 选择路线并在地图上展示
    async selectRoute(type) {
      this.selectedRoute = type
      
      // 确保地图已初始化
      if (!this.mapService.isMapLoaded()) {
        const initSuccess = await this.initMap();
        if (!initSuccess) {
          console.error('地图初始化失败，无法显示路线');
          return;
        }
      }
      
      if (!this.routes || !this.routes[type] || this.routes[type].status !== 'success') {
        return;
      }
      
      try {
        const route = this.routes[type];
        await this.mapService.drawRoute(route);
      } catch (error) {
        console.error('路线显示失败:', error);
        alert('路线显示失败，请重试');
      }
    },
    
    // 保存当前选中的路线
    async saveCurrentRoute(type) {
      if (!this.routes || !this.selectedRoute || this.isSaving) {
        return;
      }
      
      this.isSaving = true;
      
      const route = this.routes[type];
      const routeData = {
        city: this.city,
        origin: this.origin,
        destination: this.destination,
        type: type,
        duration: route.duration,
        distance: route.distance,
        path: route.path
      };
      
      try {
        await api.saveRoute(routeData);
        await this.fetchSavedRoutes();
        alert('路线保存成功');
      } catch (error) {
        console.error('保存路线失败', error);
        alert('保存路线失败，请重试');
      } finally {
        this.isSaving = false;
      }
    },
    
    // 删除保存的路线
    async deleteRoute(routeId) {
      if (confirm('确定要删除这条路线吗？')) {
        try {
          await api.deleteRoute(routeId);
          this.savedRoutes = this.savedRoutes.filter(r => r.id !== routeId);
        } catch (error) {
          console.error('删除路线失败', error);
          alert('删除路线失败，请重试');
        }
      }
    }
  }
}
</script>

<style scoped>
/* 下拉菜单样式 */
.location-input-wrapper {
  position: relative;
}

.spots-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.spot-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
}

.spot-item:hover {
  background: #f0f0f0;
}

.spot-item i {
  margin-right: 8px;
  color: #2196F3;
}

/* AI建议和加载动画样式 */
.ai-suggestion {
  background: rgba(76, 201, 240, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  border-left: 4px solid var(--accent-color);
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
