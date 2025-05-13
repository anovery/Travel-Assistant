<template>
  <div class="home">
    <section class="hero">
  <h1>
    <img src="https://img.icons8.com/ios-filled/50/cat.png" alt="猫咪图标" class="logo-icon" />
    MeowTrip
  </h1>
      <p class="subtitle"></p>
    </section>

    <section class="quick-access">
      <div 
        class="card" 
        v-for="(item, index) in quickLinks" 
        :key="item.title"
        @click="handleCardClick(item)"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = -1"
      >
        <div class="card-content">
          <img :src="item.icon" class="card-icon" />
          <p>{{ item.title }}</p>
        </div>
        
        <div 
          class="search-input-container" 
          v-show="activeIndex === index && item.searchable"
        >
          <input
            v-model="searchQueries[index]"
            type="text"
            :placeholder="item.placeholder"
            @keyup.enter="searchOnXHS(item, index)"
            ref="searchInputs"
          />
          <button @click="searchOnXHS(item, index)">
            <img src="https://img.icons8.com/ios-filled/50/search.png" alt="搜索" />
          </button>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>© 2025 MeowTrip 喵趣</p>
    </footer>

  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: -1,
      searchQueries: ['', '', ''],
      quickLinks: [
        { 
          title: '查景点', 
          icon: 'https://img.icons8.com/ios-filled/50/landscape.png',
          searchable: true,
          placeholder: '输入景点名称...',
          baseUrl: 'https://www.xiaohongshu.com/search_result?keyword='
        },
        { 
          title: '看攻略', 
          icon: 'https://img.icons8.com/ios-filled/50/map.png',
          searchable: true,
          placeholder: '输入目的地...',
          baseUrl: 'https://www.xiaohongshu.com/search_result?keyword= '
        },
        { 
          title: '我的行程', 
          icon: 'https://img.icons8.com/ios-filled/50/suitcase.png',
          searchable: false
        },
        { 
          title: '天气查询', 
          icon: 'https://img.icons8.com/ios-filled/50/partly-cloudy-day.png',
          searchable: false,
          route: '/weather'
        },
      ],
      // 其他数据保持不变
    }
  },
  methods: {
    searchOnXHS(item, index) {
      const query = this.searchQueries[index].trim();
      if (!query) return;
      
      const keyword = item.title === '看攻略' 
        ? `旅游攻略 ${query}` 
        : query;
      
      const encodedQuery = encodeURIComponent(keyword);
      window.open(`${item.baseUrl}${encodedQuery}`, '_blank');
      this.searchQueries[index] = ''; // 清空输入框
      this.activeIndex = -1; // 关闭输入框
    },
  handleCardClick(item) {
    if (item.route) {
      this.$router.push(item.route);
    }
}
  },
  watch: {
    activeIndex(newVal) {
      if (newVal !== -1 && this.quickLinks[newVal].searchable) {
        this.$nextTick(() => {
          this.$refs.searchInputs[newVal]?.focus();
        });
      }
    }
  }
}
</script>

<style scoped>
.quick-access {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
  position: relative;
}

.card {
  width: 120px;
  position: relative;
  transition: all 0.3s ease;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
}

.search-input-container {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 8px;
  display: flex;
}

.search-input-container input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.search-input-container button {
  margin-left: 8px;
  padding: 0 12px;
  background: #ff2442;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-input-container button img {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.card-icon {
  width: 30px;
  height:30px;
  margin-bottom: 8px;
}


</style>