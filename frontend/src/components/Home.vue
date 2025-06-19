<template>
  <div class="home">
    <section class="hero">
      <h1>
        <img src="https://img.icons8.com/ios-filled/50/cat.png" class="logo-icon" />
        MeowTrip
      </h1>
    </section>

    <section class="tool-sections">
      <!-- 工具卡片 -->
      <div class="card-group other-tools">
        <ClockCard />
        <CalendarCard />
        <NoteCard />
      </div>
    </section>
    
    <footer class="footer">
      <p>© 2025 MeowTrip 喵趣</p>
    </footer>
  </div>
</template>

<script>
import ClockCard from './ClockCard.vue'
import CalendarCard from './CalendarCard.vue'
import NoteCard from './NoteCard.vue'

export default {
  components: {
    ClockCard,
    CalendarCard,
    NoteCard
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logo-icon {
  width: 40px;
  height: 40px;
}

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

.card-group h2 {
  margin-bottom: 16px;
  font-size: 20px;
  color: #333;
}

.other-tools {
  display: flex;
  justify-content: space-around;
}
.footer {
  margin-top: 60px;
  text-align: center;
  color: #999;
}
</style>
