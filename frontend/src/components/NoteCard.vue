<template>
  <div class="tool-card note-card">
    <img src="https://img.icons8.com/ios-filled/40/note.png" />
    <textarea
      v-model="note"
      placeholder="写点什么吧..."
      @input="saveNote"
    ></textarea>
  </div>
</template>

<script>
export default {
  data() {
    return {
      note: localStorage.getItem('meowtrip-note') || ''
    }
  },
  methods: {
    saveNote() {
      localStorage.setItem('meowtrip-note', this.note)
    }
  }
}
</script>

<style scoped>
.note-card {
  width: 180px;
  background:rgb(224, 242, 255);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.note-card img {
  width: 30px;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 8px;
  padding: 8px;
  resize: none;
  font-size: 14px;
  background-color: #ffffff;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.05);
  outline: none;
}
</style>
