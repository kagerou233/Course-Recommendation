<template>
  <div id="app">
    <!-- 主内容区域 -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
  min-width: 960px;
  overflow-x: auto;
  overflow-y: auto;
}

/* 主内容区域 */
.main-content {
  min-height: 100vh;
  overflow-y: auto;
}
</style>
