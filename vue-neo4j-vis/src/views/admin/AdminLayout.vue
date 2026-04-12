<template>
  <div class="admin-layout">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span>学习资源推荐系统</span>
        </div>
      </div>

      <div class="sidebar-menu">
        <div class="menu-section">
          <div class="section-title">内容管理</div>
          <router-link
            v-for="item in menuItems.content"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <div :class="['menu-item', { active: isActive }]" @click="navigate">
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </div>
          </router-link>
        </div>

        <div class="menu-section">
          <div class="section-title">用户管理</div>
          <router-link
            v-for="item in menuItems.user"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <div :class="['menu-item', { active: isActive }]" @click="navigate">
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </div>
          </router-link>
        </div>

        <div class="menu-section">
          <div class="section-title">系统管理</div>
          <router-link
            v-for="item in menuItems.system"
            :key="item.key"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <div :class="['menu-item', { active: isActive }]" @click="navigate">
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-content">
      <!-- 顶部工具栏 -->
      <div class="content-header">
        <div class="header-left">
          <h2>{{ currentPageTitle }}</h2>
          <div class="breadcrumb">
            <span>管理后台</span>
            <i class="el-icon-arrow-right"></i>
            <span>{{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd">
            <i class="el-icon-plus"></i>
            添加内容
          </el-button>
          <el-dropdown @command="handleUserCommand">
            <el-button type="text" class="user-btn">
              <i class="el-icon-user"></i>
              {{ currentUser.username }}
              <i class="el-icon-arrow-down"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="user-view">用户视图</el-dropdown-item>
              <el-dropdown-item divided command="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-body">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminLayout",
  data() {
    return {
      currentUser: {},
      menuItems: {
        content: [
          {
            key: "resources",
            name: "资源管理",
            icon: "el-icon-reading",
            path: "/admin/resources",
          },
          {
            key: "categories",
            name: "分类管理",
            icon: "el-icon-menu",
            path: "/admin/categories",
          },
          {
            key: "tags",
            name: "标签管理",
            icon: "el-icon-price-tag",
            path: "/admin/tags",
          },
        ],
        user: [
          {
            key: "users",
            name: "用户管理",
            icon: "el-icon-user",
            path: "/admin/users",
          },
          {
            key: "roles",
            name: "角色权限",
            icon: "el-icon-key",
            path: "/admin/roles",
          },
          {
            key: "feedback",
            name: "用户反馈",
            icon: "el-icon-chat-dot-round",
            path: "/admin/feedback",
          },
        ],
        system: [
          {
            key: "analytics",
            name: "数据统计",
            icon: "el-icon-data-analysis",
            path: "/admin/analytics",
          },
          {
            key: "settings",
            name: "系统设置",
            icon: "el-icon-setting",
            path: "/admin/settings",
          },
          {
            key: "neo4j",
            name: "Neo4j可视化",
            icon: "el-icon-connection",
            path: "/admin/neo4j",
          },
        ],
      },
    };
  },
  computed: {
    currentPageTitle() {
      const allItems = [
        ...this.menuItems.content,
        ...this.menuItems.user,
        ...this.menuItems.system,
      ];
      const currentPath = this.$route.path;
      const item = allItems.find((item) => item.path === currentPath);
      return item ? item.name : "管理后台";
    },
  },
  mounted() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    },
    handleAdd() {
      this.$message.info("添加功能开发中...");
    },
    handleUserCommand(command) {
      switch (command) {
        case "profile":
          this.$message.info("个人资料功能开发中...");
          break;
        case "settings":
          this.$message.info("系统设置功能开发中...");
          break;
        case "user-view":
          this.$router.push("/learning");
          break;
        case "logout":
          this.handleLogout();
          break;
      }
    },
    handleLogout() {
      this.$confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$message.success("已退出登录");
        this.$router.push("/login");
      });
    },
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

/* 左侧导航栏 */
.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #1f2937;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  padding: 20px 0;
}

.menu-section {
  margin-bottom: 30px;
}

.section-title {
  padding: 0 20px 10px;
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #d1d5db;
}

.menu-item:hover {
  background: #1f2937;
  color: #1890ff;
}

.menu-item.active {
  background: #1890ff;
  color: white;
  position: relative;
}

.menu-item.active::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #40a9ff;
}

.menu-item i {
  font-size: 16px;
  width: 16px;
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #262626;
}

.breadcrumb {
  font-size: 14px;
  color: #8c8c8c;
}

.breadcrumb i {
  margin: 0 8px;
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-btn {
  color: #595959;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 内容主体 */
.content-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
