<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <i class="el-icon-info"></i>
      <h3>{{ pageTitle }}</h3>
      <p>该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlaceholderPage",
  computed: {
    pageTitle() {
      return this.$route.meta.title || "功能开发中";
    },
  },
};
</script>

<style scoped>
.placeholder-page {
  padding: 24px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #8c8c8c;
}

.placeholder-content i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

.placeholder-content h3 {
  margin: 0 0 8px 0;
  color: #595959;
  font-size: 20px;
}

.placeholder-content p {
  margin: 0;
  font-size: 14px;
}
</style>
