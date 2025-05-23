import AMapLoader from '@amap/amap-jsapi-loader'
import { mapConfig } from '../config/mapConfig'
import RouteUtils from '../utils/RouteUtils'
import CoordinateMonitor from '../utils/CoordinateMonitor'

class MapService {
  constructor() {
    this.map = null;
    this.AMap = null;
    this.mapLoaded = false;
    this.mapInitRetryCount = 0;
    this.maxMapInitRetry = 3;
    this.coordinateMonitor = null; // 坐标监控器
  }

  /**
   * 检查地图是否已加载
   */
  isMapLoaded() {
    return this.mapLoaded && this.map;
  }

  /**
   * 设置安全配置
   * 确保在初始化地图前设置安全域配置
   */
  setSecurityConfig() {
    if (window._AMapSecurityConfig === undefined) {
      window._AMapSecurityConfig = {
        serviceHost: 'https://localhost:5000/_AMapService',
      };
      console.log('已设置AMap安全配置');
    }
  }

  /**
   * 初始化地图
   * @param {HTMLElement} mapContainer - 地图容器DOM元素
   * @returns {Promise<boolean>} - 返回是否成功初始化
   */
  async initMap(mapContainer) {
    // 如果地图已加载，直接返回
    if (this.isMapLoaded()) {
      return true;
    }
    
    // 确保安全配置已设置
    this.setSecurityConfig();
    
    try {
      // 检查地图容器是否存在
      if (!mapContainer) {
        console.error('地图容器元素不存在，尝试稍后初始化');
        
        // 只有在重试次数小于最大重试次数时才继续尝试
        if (this.mapInitRetryCount < this.maxMapInitRetry) {
          this.mapInitRetryCount++;
          console.log(`初始化重试 ${this.mapInitRetryCount}/${this.maxMapInitRetry}`);
          
          // 使用Promise.resolve和setTimeout代替递归调用
          return new Promise(resolve => {
            setTimeout(async () => {
              const result = await this.initMap(mapContainer);
              resolve(result);
            }, 200);
          });
        } else {
          console.error(`已达到最大重试次数(${this.maxMapInitRetry})，地图初始化失败`);
          return false;
        }
      }
      
      // 重置重试计数器
      this.mapInitRetryCount = 0;
      
      // 检查容器尺寸
      const containerWidth = mapContainer.offsetWidth;
      const containerHeight = mapContainer.offsetHeight;
      console.log('地图容器尺寸:', {width: containerWidth, height: containerHeight});
      
      if (containerWidth === 0 || containerHeight === 0) {
        console.error('地图容器尺寸为0，请检查CSS');
        return false;
      }
      
      console.log('开始初始化地图');
      this.AMap = await AMapLoader.load({
        key: mapConfig.jsApiKey, // 从配置文件导入JS API Key
        version: mapConfig.version,
        plugins: mapConfig.plugins
      })
      console.log('AMap加载成功:', !!this.AMap);
      
      // 先创建地图实例，设置一个安全的初始中心点
      this.map = new this.AMap.Map(mapContainer, {
        zoom: 11,
        center: [116.397428, 39.90923], // 默认北京
        resizeEnable: true,
        rotateEnable: false,
        pitchEnable: false,
        // 禁用可能导致坐标问题的功能
        dragEnable: true,
        zoomEnable: true,
        doubleClickZoom: false
      })
      console.log('地图实例创建成功:', !!this.map);
      
      // 等待地图完全加载后再添加控件
      this.map.on('complete', () => {
        console.log('地图加载完成，开始添加控件');
        
        try {
          // 创建比例尺控件
          const scale = new this.AMap.Scale({
            position: 'LB' // 左下角
          });
          this.map.addControl(scale);
          console.log('比例尺控件添加成功');
          
          // 创建工具栏控件，但要谨慎配置
          const toolBar = new this.AMap.ToolBar({
            position: 'RT', // 右上角
            locate: false,  // 禁用定位功能，避免坐标问题
            autoPosition: false, // 禁用自动定位
            liteStyle: true  // 使用精简样式
          });
          this.map.addControl(toolBar);
          console.log('工具栏控件添加成功');
          
          // 初始化坐标监控器
          this.coordinateMonitor = new CoordinateMonitor(this.map);
          this.coordinateMonitor.startMonitoring();
          console.log('坐标监控器启动成功');
          
        } catch (controlError) {
          console.error('添加地图控件时出错:', controlError);
        }
      });
      
      // 添加地图事件监听，确保坐标状态正常
      this.map.on('moveend', () => {
        try {
          const center = this.map.getCenter();
          if (center && !isNaN(center.getLng()) && !isNaN(center.getLat())) {
            console.log('地图中心点正常:', [center.getLng(), center.getLat()]);
          } else {
            console.warn('地图中心点异常，重置为默认位置');
            this.map.setCenter([116.397428, 39.90923]);
          }
        } catch (e) {
          console.error('地图移动事件处理错误:', e);
        }
      });
      
      this.mapLoaded = true
      console.log('地图加载完成并添加了控件');
      return true;
    } catch (e) {
      console.error('地图初始化失败', e);
      // 标记地图未加载成功
      this.mapLoaded = false;
      return false;
    }
  }

  /**
   * 在地图上绘制路线
   * @param {Object} route - 路线数据
   */
  async drawRoute(route) {
    if (!this.isMapLoaded()) {
      console.error('尝试在地图未初始化时绘制路线');
      throw new Error('地图未初始化');
    }

    console.log('开始绘制路线，清除现有内容');
    
    // 安全地清除地图内容
    try {
      this.map.clearMap();
      console.log('地图清除成功');
    } catch (e) {
      console.error('清除地图时出错:', e);
    }

    // 检查路径数据
    console.log('绘制路线数据:', route);
    const path = route.path;
    
    // 检查路径数据有效性
    if (!path || !Array.isArray(path) || path.length === 0) {
      console.error('路线数据中没有路径信息或格式不正确');
      return;
    }
    
    try {
      console.log('开始处理路线坐标');
      // 收集所有有效坐标点
      const allValidCoords = this.collectValidCoordinates(path);
      console.log('收集到的有效坐标:', allValidCoords);
      
      // 如果没有有效坐标点，则提前返回
      if (allValidCoords.length === 0) {
        console.error('路线中没有有效的坐标点，使用默认视图');
        // 设置默认视图而不是失败
        this.map.setCenter([116.397428, 39.90923]);
        this.map.setZoom(11);
        return;
      }
      
      // 使用第一个和最后一个有效坐标作为起终点
      const firstPoint = allValidCoords[0];
      const lastPoint = allValidCoords[allValidCoords.length - 1];
      console.log('使用的起点和终点:', { firstPoint, lastPoint });
      
      // 先调整地图视图，确保坐标系统稳定
      try {
        console.log('首先调整地图视图');
        this.adjustMapView(allValidCoords);
        
        // 等待视图调整完成
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error('调整地图视图失败:', error);
        // 使用默认中心点
        this.map.setCenter([116.397428, 39.90923]);
        this.map.setZoom(11);
      }
      
      try {
        // 添加起点标记
        console.log('添加起点标记');
        this.addMarker(firstPoint, true); // true for start point
        console.log('添加起点标记成功');
        
        // 添加终点标记  
        console.log('添加终点标记');
        this.addMarker(lastPoint, false); // false for end point
        console.log('添加终点标记成功');
      } catch (error) {
        console.error('添加标记点失败:', error);
      }
      
      try {
        // 绘制路线
        console.log('开始绘制路线段');
        this.drawPathSegments(path);
        console.log('绘制路线段成功');
      } catch (error) {
        console.error('绘制路线段失败:', error);
      }
      
      // 最后验证地图状态
      setTimeout(() => {
        try {
          const center = this.map.getCenter();
          const zoom = this.map.getZoom();
          console.log('绘制完成后地图状态 - 中心:', [center.getLng(), center.getLat()], '缩放:', zoom);
          
          // 检查中心点是否有效
          if (isNaN(center.getLng()) || isNaN(center.getLat())) {
            console.warn('检测到地图中心点异常，重置');
            this.map.setCenter([116.397428, 39.90923]);
          }
        } catch (e) {
          console.error('验证地图状态时出错:', e);
        }
      }, 500);
      
    } catch (e) {
      console.error('绘制路线失败:', e);
      throw e;
    }
  }
  
  /**
   * 收集路径中的所有有效坐标
   * @param {Array} path - 路径数据数组
   * @returns {Array} - 有效坐标点数组
   */
  collectValidCoordinates(path) {
    console.log('收集路径坐标，路径数据:', path);
    const allValidCoords = [];
    
    if (!path || !Array.isArray(path)) {
      console.warn('路径数据无效:', path);
      return allValidCoords;
    }
    
    // 首先检查所有路径段并收集有效坐标
    for (const segment of path) {
      console.log('处理路径段:', segment);
      
      if (!segment) {
        console.warn('路径段为空');
        continue;
      }
      
      if (!segment.coordinates) {
        console.warn('路径段没有坐标数据:', segment);
        continue;
      }
      
      if (!Array.isArray(segment.coordinates)) {
        console.warn('路径段坐标不是数组:', segment.coordinates);
        continue;
      }
      
      // 提取所有有效坐标
      try {
        const validCoords = RouteUtils.filterValidCoordinates(segment.coordinates);
        console.log(`路径段有效坐标: ${validCoords.length}/${segment.coordinates.length}`);
        
        // 如果所有坐标都无效，尝试修复坐标格式
        if (validCoords.length === 0 && segment.coordinates.length > 0) {
          console.log('尝试修复坐标格式:', segment.coordinates[0]);
          
          // 尝试不同的格式解析
          const fixedCoords = this.tryFixCoordinates(segment.coordinates);
          if (fixedCoords.length > 0) {
            console.log('坐标修复成功:', fixedCoords.length);
            segment.coordinates = fixedCoords;
            allValidCoords.push(...fixedCoords);
            continue;
          }
        }
        
        segment.coordinates = validCoords; // 更新为有效坐标
        
        if (validCoords.length > 0) {
          allValidCoords.push(...validCoords);
        }
      } catch (error) {
        console.error('处理坐标时出错:', error);
      }
    }
    
    console.log('收集到的有效坐标总数:', allValidCoords.length);
    
    // 如果没有有效坐标，使用默认坐标
    if (allValidCoords.length === 0) {
      console.warn('没有有效坐标，使用默认坐标');
      // 使用默认坐标 (北京)
      return [[116.397428, 39.90923], [116.407428, 39.91923]];
    }
    
    return allValidCoords;
  }
  
  /**
   * 尝试修复坐标格式
   * @param {Array} coordinates - 可能格式不正确的坐标数组
   * @returns {Array} - 修复后的坐标数组
   */
  tryFixCoordinates(coordinates) {
    const fixedCoords = [];
    
    for (const coord of coordinates) {
      if (!coord) continue;
      
      // 尝试不同的格式修复
      try {
        // 如果是字符串，尝试解析为JSON
        if (typeof coord === 'string') {
          try {
            const parsed = JSON.parse(coord);
            if (Array.isArray(parsed) && parsed.length === 2) {
              const [lng, lat] = parsed;
              if (!isNaN(lng) && !isNaN(lat)) {
                fixedCoords.push([lng, lat]);
                continue;
              }
            }
          } catch (e) {
            // 不是有效的JSON，尝试其他方法
          }
          
          // 尝试按逗号分割
          const parts = coord.split(',');
          if (parts.length === 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            if (!isNaN(lng) && !isNaN(lat)) {
              fixedCoords.push([lng, lat]);
              continue;
            }
          }
        }
        
        // 如果是对象，尝试提取lng和lat属性
        if (typeof coord === 'object' && coord !== null) {
          if (coord.lng !== undefined && coord.lat !== undefined) {
            const lng = parseFloat(coord.lng);
            const lat = parseFloat(coord.lat);
            if (!isNaN(lng) && !isNaN(lat)) {
              fixedCoords.push([lng, lat]);
              continue;
            }
          }
          
          // 尝试其他可能的属性名
          if (coord.longitude !== undefined && coord.latitude !== undefined) {
            const lng = parseFloat(coord.longitude);
            const lat = parseFloat(coord.latitude);
            if (!isNaN(lng) && !isNaN(lat)) {
              fixedCoords.push([lng, lat]);
              continue;
            }
          }
          
          // 尝试x,y作为经纬度
          if (coord.x !== undefined && coord.y !== undefined) {
            const lng = parseFloat(coord.x);
            const lat = parseFloat(coord.y);
            if (!isNaN(lng) && !isNaN(lat)) {
              fixedCoords.push([lng, lat]);
              continue;
            }
          }
        }
      } catch (error) {
        console.warn('尝试修复坐标时出错:', error);
      }
    }
    
    return fixedCoords;
  }
  
  /**
   * 添加标记点
   * @param {Array} position - 坐标位置
   * @param {boolean} isStart - 是否为起点
   */
  addMarker(position, isStart) {
    console.log('添加标记点:', position, isStart ? '起点' : '终点');
    
    try {
      // 确保坐标有效
      if (!RouteUtils.isValidCoord(position)) {
        console.error('尝试添加标记点时坐标无效:', position);
        return;
      }
      
      // 规范化坐标格式
      const [lng, lat] = Array.isArray(position) ? position : [position.lng || position.x, position.lat || position.y];
      
      // 再次验证解析后的坐标
      if (isNaN(lng) || isNaN(lat) || !isFinite(lng) || !isFinite(lat)) {
        console.error('解析后的坐标无效:', { lng, lat });
        return;
      }
      
      const normalizedPosition = [parseFloat(lng), parseFloat(lat)];
      console.log('规范化后的坐标:', normalizedPosition);
      
      const pixelOffset = isStart ? -9 : -95; // 起点和终点图标的偏移量不同
      
      // 使用简单的圆形标记而不是自定义图标，避免图标加载问题
      const marker = new this.AMap.Marker({
        map: this.map,
        position: normalizedPosition,
        // 使用默认标记样式
        content: `<div style="
          width: 20px; 
          height: 20px; 
          background: ${isStart ? '#22AA66' : '#DD3333'}; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`
      });
      
      console.log('标记点添加成功');
      
    } catch (error) {
      console.error('添加标记点发生错误:', error);
      console.error('错误详情:', error.stack);
    }
  }
  
  /**
   * 绘制路径段
   * @param {Array} path - 路径数据
   */
  drawPathSegments(path) {
    if (!path || !Array.isArray(path)) {
      console.error('路径数据无效');
      return;
    }
    
    for (const segment of path) {
      if (!segment) {
        console.warn('路径段为空');
        continue;
      }
      
      if (!segment.coordinates) {
        console.warn('路径段没有坐标数据');
        continue;
      }
      
      console.log('绘制路径段:', segment.type, '坐标点数:', segment.coordinates.length);
      
      // 确保至少有两个有效坐标点才绘制线段
      if (segment.coordinates && segment.coordinates.length > 1) {
        // 双重验证所有坐标点
        const validatedCoords = [];
        for (const coord of segment.coordinates) {
          if (RouteUtils.isValidCoord(coord)) {
            // 确保坐标是数组格式并且是数字
            const [lng, lat] = Array.isArray(coord) ? coord : [coord.lng || coord.x, coord.lat || coord.y];
            if (!isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat)) {
              validatedCoords.push([parseFloat(lng), parseFloat(lat)]);
            }
          }
        }
        
        console.log(`路径段验证后坐标: ${validatedCoords.length}/${segment.coordinates.length}`);
        
        if (validatedCoords.length < 2) {
          console.warn('验证后的有效坐标不足2个，跳过绘制:', validatedCoords.length);
          continue;
        }
        
        // 根据路线类型设置不同颜色
        let color = '#3366FF'; // 默认蓝色
        
        if (segment.type === 'walking') {
          color = '#22AA66'; // 步行为绿色
        } else if (segment.type === 'subway') {
          color = '#DD3333'; // 地铁为红色
        } else if (segment.type === 'bus') {
          color = '#FFAA00'; // 公交为橙色
        }
        
        try {
          console.log('尝试绘制路径段，颜色:', color, '坐标数量:', validatedCoords.length);
          
          // 使用验证后的坐标绘制线段
          const polyline = new this.AMap.Polyline({
            map: this.map,
            path: validatedCoords,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 6,
            strokeStyle: 'solid'
          });
          
          console.log('路径段绘制成功');
          
        } catch (error) {
          console.error('绘制路径段发生错误:', error);
          console.error('出错时的坐标数据:', validatedCoords);
        }
      } else {
        console.warn('路径段坐标点不足:', segment);
      }
    }
  }
  
  /**
   * 添加路段说明文本
   * @param {Object} segment - 路段数据
   */
  addSegmentInstruction(segment) {
    if (segment.instruction && segment.coordinates.length > 0) {
      const midIdx = Math.floor(segment.coordinates.length / 2);
      const midPoint = segment.coordinates[midIdx];
      
      if (RouteUtils.isValidCoord(midPoint)) {
        new this.AMap.Text({
          text: segment.instruction,
          position: midPoint,
          map: this.map,
          style: {
            'background-color': '#fff',
            'border-radius': '3px',
            'border-width': '1px',
            'border-color': '#ccc',
            'padding': '5px',
            'font-size': '12px',
            'box-shadow': '0 2px 6px 0 rgba(0, 0, 0, .1)'
          }
        });
      }
    }
  }
  
  /**
   * 调整地图视图以包含所有坐标点
   * @param {Array} coordinates - 坐标点数组
   */
  adjustMapView(coordinates) {
    console.log('开始调整地图视图, 坐标数量:', coordinates.length);
    
    if (!coordinates || coordinates.length === 0) {
      console.warn('没有坐标点可用于调整视图');
      return;
    }
    
    try {
      // 过滤并验证所有坐标
      const validCoords = coordinates.filter(coord => {
        if (!RouteUtils.isValidCoord(coord)) {
          return false;
        }
        const [lng, lat] = Array.isArray(coord) ? coord : [coord.lng || coord.x, coord.lat || coord.y];
        return !isNaN(lng) && !isNaN(lat) && isFinite(lng) && isFinite(lat);
      });
      
      console.log(`有效坐标数量: ${validCoords.length}/${coordinates.length}`);
      
      if (validCoords.length === 0) {
        console.warn('没有有效坐标，使用默认中心点');
        this.map.setCenter([116.397428, 39.90923]);
        this.map.setZoom(11);
        return;
      }
      
      if (validCoords.length === 1) {
        console.log('只有一个坐标点，设置为中心点');
        this.map.setCenter(validCoords[0]);
        this.map.setZoom(15);
        return;
      }
      
      // 使用第一个坐标点初始化边界
      const [firstLng, firstLat] = Array.isArray(validCoords[0]) ? validCoords[0] : [validCoords[0].lng, validCoords[0].lat];
      let minLng = firstLng, maxLng = firstLng;
      let minLat = firstLat, maxLat = firstLat;
      
      // 计算所有坐标的边界
      for (const coord of validCoords) {
        const [lng, lat] = Array.isArray(coord) ? coord : [coord.lng || coord.x, coord.lat || coord.y];
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
      
      console.log('计算出的边界:', { minLng, maxLng, minLat, maxLat });
      
      // 检查边界值是否有效
      if (isNaN(minLng) || isNaN(maxLng) || isNaN(minLat) || isNaN(maxLat)) {
        console.error('边界计算结果包含NaN值');
        this.map.setCenter([116.397428, 39.90923]);
        this.map.setZoom(11);
        return;
      }
      
      // 添加边界padding
      const lngPadding = (maxLng - minLng) * 0.1;
      const latPadding = (maxLat - minLat) * 0.1;
      
      // 创建边界对象
      const bounds = new this.AMap.Bounds(
        [minLng - lngPadding, minLat - latPadding],
        [maxLng + lngPadding, maxLat + latPadding]
      );
      
      console.log('设置地图边界');
      this.map.setBounds(bounds);
      
      // 添加一个延迟，然后验证视图是否正确设置
      setTimeout(() => {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        console.log('地图视图调整后 - 中心点:', [center.getLng(), center.getLat()], '缩放级别:', zoom);
      }, 100);
      
    } catch (e) {
      console.error('设置地图视图范围失败:', e);
      // 回退方案: 使用第一个有效坐标作为中心点
      try {
        const firstValid = coordinates.find(coord => RouteUtils.isValidCoord(coord));
        if (firstValid) {
          console.log('使用回退方案，设置中心点:', firstValid);
          this.map.setCenter(firstValid);
          this.map.setZoom(13);
        } else {
          console.log('使用默认中心点');
          this.map.setCenter([116.397428, 39.90923]);
          this.map.setZoom(11);
        }
      } catch (fallbackError) {
        console.error('回退方案也失败:', fallbackError);
      }
    }
  }
}

export default MapService;
