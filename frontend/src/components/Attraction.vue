<template>
  <div>
    <h1>景点查询</h1>
    <section class="tool-sections">
      <!-- 查景点 + 看攻略 -->
      <div class="card-group">
        <h2>“小红书”一下</h2>
        <SearchBox />
      </div>
    </section>
  </div>
</template>

<script>
import SearchBox from './SearchBox.vue'

export default {
  components: {
    SearchBox
  }
}
</script>

<style scoped>
.tool-sections {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px;
}

.card-group {
  background: #fff;
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 80%;
}

</style>