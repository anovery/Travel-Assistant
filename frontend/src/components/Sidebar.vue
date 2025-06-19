<template>
  <div class="sidebar">
    <div class="logo">
      <span class="icon-logo">🐱</span> 
    </div>
    <ul>
      <li>
        <router-link to="/">
          <span class="icon">🏠</span>
          <span class="tooltip">首页</span>
        </router-link>
      </li>
      <li>
        <router-link to="/attraction">
          <span class="icon">🏯</span>
          <span class="tooltip">景点查询</span>
        </router-link>
      </li>
      <li>
        <router-link to="/weather">
          <span class="icon">🌤️</span>
          <span class="tooltip">天气查询</span>
        </router-link>
      </li>
      <li>
        <router-link to="/transport">
          <span class="icon">🚄</span>
          <span class="tooltip">交通查询</span>
        </router-link>
      </li>
      <li>
        <router-link to="/plan">
          <span class="icon">🗓️</span>
          <span class="tooltip">行程规划</span>
        </router-link>
      </li>
      <!-- 可继续添加其他菜单项 -->
    </ul>
  </div>
</template>

<style scoped>
.sidebar {
  width: 60px;
  min-width: 60px;
  height: 100%;
  background: rgb(110, 138, 169);
  color: white;
  padding: 20px 0;
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar:hover {
  width: 180px; /* 悬停时展开显示文字 */
}

.logo {
  text-align: center;
  padding: 0 10px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 20px;
}

.icon-logo {
  font-size: 28px;
}

ul {
  list-style: none;
  padding: 0 10px;
}

li {
  margin: 15px 0;
  white-space: nowrap;
}

a {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

a:hover {
  background: rgba(255,255,255,0.1);
}

.icon {
  font-size: 24px;
  margin-right: 15px;
  min-width: 24px;
}

.tooltip {
  opacity: 0;
  transition: opacity 0.3s;
}

.sidebar:hover .tooltip {
  opacity: 1;
}

a.router-link-active {
  background: rgba(255,255,255,0.2);
  font-weight: bold;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 50px;
    min-width: 50px;
  }
  .icon {
    font-size: 20px;
  }
}
</style>