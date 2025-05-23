/**
 * 路线工具类
 * 提供路线相关的工具函数
 */
class RouteUtils {
  /**
   * 检查坐标是否有效
   * @param {Array} coord - 坐标数组 [lng, lat]
   * @returns {boolean} - 是否为有效坐标
   */
  static isValidCoord(coord) {
    // 检查是否为数组且包含两个元素
    if (!Array.isArray(coord) || coord.length !== 2) {
      return false;
    }
    
    // 检查经纬度值是否为有效数字
    const [lng, lat] = coord;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return false;
    }
    
    if (isNaN(lng) || isNaN(lat)) {
      return false;
    }
    
    // 简单检查经纬度范围(经度: -180到180, 纬度: -90到90)
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 过滤路径中的无效坐标
   * @param {Array} coordinates - 坐标数组
   * @returns {Array} - 有效坐标数组
   */
  static filterValidCoordinates(coordinates) {
    if (!Array.isArray(coordinates)) {
      return [];
    }
    return coordinates.filter(coord => this.isValidCoord(coord));
  }
  
  /**
   * 获取交通方式的图标
   * @param {string} type - 交通方式类型
   * @returns {string} - 对应的图标类名
   */
  static getRouteIcon(type) {
    const icons = {
      driving: 'fas fa-car',
      transit: 'fas fa-bus',
      walking: 'fas fa-walking',
      subway: 'fas fa-subway'
    }
    return icons[type] || 'fas fa-route';
  }
  
  /**
   * 获取交通方式的名称
   * @param {string} type - 交通方式类型
   * @returns {string} - 对应的名称
   */
  static getRouteTypeName(type) {
    const names = {
      driving: '驾车',
      transit: '公交',
      walking: '步行',
      subway: '地铁'
    }
    return names[type] || type;
  }
  
  /**
   * 计算两个坐标点之间的距离（直线距离，单位：公里）
   * @param {Array} coord1 - 第一个坐标点 [lng1, lat1]
   * @param {Array} coord2 - 第二个坐标点 [lng2, lat2]
   * @returns {number} - 两点之间的距离（公里）
   */
  static calculateDistance(coord1, coord2) {
    if (!this.isValidCoord(coord1) || !this.isValidCoord(coord2)) {
      return 0;
    }
    
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;
    
    // 地球半径（公里）
    const R = 6371;
    
    // 将经纬度转换为弧度
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    // Haversine公式
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // 距离（公里）
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * 将角度转换为弧度
   * @param {number} degrees - 角度
   * @returns {number} - 弧度
   */
  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  /**
   * 格式化距离显示
   * @param {number} distance - 距离（公里）
   * @returns {string} - 格式化后的距离字符串
   */
  static formatDistance(distance) {
    if (distance < 1) {
      // 不足1公里时，显示为米
      return `${Math.round(distance * 1000)}米`;
    } else {
      // 超过1公里时，保留一位小数
      return `${distance.toFixed(1)}公里`;
    }
  }
  
  /**
   * 格式化时间显示
   * @param {number} minutes - 时间（分钟）
   * @returns {string} - 格式化后的时间字符串
   */
  static formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    }
  }
}

export default RouteUtils;
