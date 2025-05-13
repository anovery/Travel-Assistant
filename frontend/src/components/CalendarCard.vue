<template>
  <div class="tool-card calendar-card">
    <img src="https://img.icons8.com/ios-filled/40/calendar--v1.png" />
    <p class="month-title">{{ monthYear }}</p>
    <div class="calendar-grid">
      <div class="day-name" v-for="day in weekDays" :key="day">{{ day }}</div>
      <div
        v-for="(date, index) in calendarDays"
        :key="index"
        :class="['date-cell', { today: date.isToday, empty: !date.day }]"
      >
        {{ date.day || '' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      today: new Date(),
      calendarDays: [],
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      monthYear: ''
    }
  },
  mounted() {
    this.generateCalendar()
  },
  methods: {
    generateCalendar() {
      const now = this.today
      const year = now.getFullYear()
      const month = now.getMonth()

      this.monthYear = `${year}年${month + 1}月`

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startWeekday = firstDay.getDay()

      const days = []

      // 空白填充
      for (let i = 0; i < startWeekday; i++) {
        days.push({ day: null })
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const isToday =
          d === now.getDate() &&
          month === now.getMonth() &&
          year === now.getFullYear()

        days.push({ day: d, isToday })
      }

      this.calendarDays = days
    }
  }
}
</script>

<style scoped>
.calendar-card {
  width: 240px;
  background:rgb(255, 246, 224);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.calendar-card img {
  width: 32px;
  margin-bottom: 4px;
}

.month-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  font-size: 13px;
}

.day-name {
  font-weight: bold;
  color: #888;
}

.date-cell {
  width: 100%;
  padding: 6px 0;
  border-radius: 6px;
  background: #f5f5f5;
}

.date-cell.today {
  background:rgb(250, 209, 199);
  color: #fff;
  font-weight: bold;
}

.date-cell.empty {
  background: transparent;
}
</style>
