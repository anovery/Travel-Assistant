<template>
  <div class="home-container">
    <h1>欢迎来到旅游助手</h1>
    <p class="subtitle">您的智能旅行规划小帮手</p>

    <div class="features">
      <div class="card" v-for="(feature, index) in features" :key="index">
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.desc }}</p>
        <button @click="goTo(feature.route)">进入</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      features: [
        { title: '推荐景点', desc: '发现热门景点和隐藏的宝藏地点', route: '/recommend' },
        { title: '路线规划', desc: '智能生成您的旅游行程', route: '/planner' },
        { title: '天气查询', desc: '获取目的地最新天气情况', route: '/weather' }
      ]
    }
  },
  methods: {
    goTo(route) {
      // 如果你使用 vue-router，可在此跳转
      this.$router.push(route)
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 2rem;
  text-align: center;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  width: 250px;
  padding: 1rem;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
}

.card h2 {
  margin-bottom: 0.5rem;
}

.card button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.card button:hover {
  background-color: #369f6e;
}
</style>
