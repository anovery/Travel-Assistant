<template>
  <div class="search-box">
    <div 
      class="search-item" 
      v-for="(item, index) in tools" 
      :key="item.title"
    >
      <img :src="item.icon" class="icon" />
      <div class="input-group">
        <input
          v-model="queries[index]"
          :placeholder="item.placeholder"
          @keyup.enter="search(item, index)"
        />
        <button @click="search(item, index)">
          <img src="https://img.icons8.com/ios-filled/20/search.png" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queries: ['', ''],
      tools: [
        {
          title: '查景点',
          icon: 'https://img.icons8.com/ios-filled/40/landscape.png',
          placeholder: '输入景点名称...',
          baseUrl: 'https://www.xiaohongshu.com/search_result?keyword='
        },
        {
          title: '看攻略',
          icon: 'https://img.icons8.com/ios-filled/40/map.png',
          placeholder: '输入攻略地点+时间...',
          baseUrl: 'https://www.xiaohongshu.com/search_result?keyword=旅游攻略+'
        }
      ]
    };
  },
  methods: {
    search(item, index) {
      const q = this.queries[index].trim();
      if (!q) return;
      window.open(`${item.baseUrl}${encodeURIComponent(q)}`, '_blank');
      this.queries[index] = '';
    }
  }
};
</script>

<style scoped>
.search-box {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.icon {
  width: 30px;
  height: 30px;
}

.input-group {
  flex: 1;
  display: flex;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
}

input {
  flex: 1;
  border: none;
  padding: 8px 12px;
  outline: none;
  background: transparent;
}

button {
  background: #ff2442;
  border: none;
  padding: 0 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

button img {
  filter: brightness(0) invert(1);
}
</style>
