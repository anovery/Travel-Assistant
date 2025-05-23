/**
 * 坐标监控工具
 * 用于监控和修复地图中的坐标问题
 */
class CoordinateMonitor {
  constructor(map) {
    this.map = map;
    this.monitoring = false;
    this.monitorInterval = null;
    this.validationErrors = [];
  }

  /**
   * 开始监控地图坐标状态
   */
  startMonitoring() {
    if (this.monitoring) return;
    
    console.log('开始监控地图坐标状态');
    this.monitoring = true;
    
    // 每2秒检查一次地图状态
    this.monitorInterval = setInterval(() => {
      this.checkMapState();
    }, 2000);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.monitoring) return;
    
    console.log('停止监控地图坐标状态');
    this.monitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * 检查地图状态
   */
  checkMapState() {
    if (!this.map) return;

    try {
      // 检查地图中心点
      const center = this.map.getCenter();
      if (center) {
        const lng = center.getLng();
        const lat = center.getLat();
        
        if (isNaN(lng) || isNaN(lat)) {
          console.warn('检测到地图中心点坐标异常:', { lng, lat });
          this.fixMapCenter();
        }
      }

      // 检查地图缩放级别
      const zoom = this.map.getZoom();
      if (isNaN(zoom) || zoom < 1 || zoom > 20) {
        console.warn('检测到地图缩放级别异常:', zoom);
        this.fixMapZoom();
      }

      // 检查地图边界
      this.checkMapBounds();

    } catch (error) {
      console.error('检查地图状态时出错:', error);
      this.logValidationError('MapStateCheck', error);
    }
  }

  /**
   * 修复地图中心点
   */
  fixMapCenter() {
    try {
      console.log('修复地图中心点');
      const defaultCenter = [116.397428, 39.90923]; // 北京
      this.map.setCenter(defaultCenter);
      console.log('地图中心点已重置为:', defaultCenter);
    } catch (error) {
      console.error('修复地图中心点失败:', error);
    }
  }

  /**
   * 修复地图缩放级别
   */
  fixMapZoom() {
    try {
      console.log('修复地图缩放级别');
      this.map.setZoom(11);
      console.log('地图缩放级别已重置为: 11');
    } catch (error) {
      console.error('修复地图缩放级别失败:', error);
    }
  }

  /**
   * 检查地图边界
   */
  checkMapBounds() {
    try {
      const bounds = this.map.getBounds();
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        
        if (sw && ne) {
          const swLng = sw.getLng();
          const swLat = sw.getLat();
          const neLng = ne.getLng();
          const neLat = ne.getLat();
          
          if (isNaN(swLng) || isNaN(swLat) || isNaN(neLng) || isNaN(neLat)) {
            console.warn('检测到地图边界坐标异常');
            this.fixMapCenter(); // 重置中心点通常能修复边界问题
          }
        }
      }
    } catch (error) {
      console.error('检查地图边界时出错:', error);
    }
  }

  /**
   * 记录验证错误
   */
  logValidationError(type, error) {
    const errorInfo = {
      type,
      error: error.message || error,
      timestamp: new Date().toISOString()
    };
    
    this.validationErrors.push(errorInfo);
    
    // 只保留最近的10个错误
    if (this.validationErrors.length > 10) {
      this.validationErrors = this.validationErrors.slice(-10);
    }
  }

  /**
   * 获取验证错误历史
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * 清除验证错误历史
   */
  clearValidationErrors() {
    this.validationErrors = [];
  }

  /**
   * 手动触发地图状态检查和修复
   */
  forceCheck() {
    console.log('手动触发地图状态检查');
    this.checkMapState();
  }
}

export default CoordinateMonitor;