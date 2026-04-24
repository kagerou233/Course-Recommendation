<template>
  <div class="learning-container">
    <!-- 横向导航栏 -->
    <div class="horizontal-nav">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <i class="el-icon-star-on"></i>
            <span>智能学习推荐</span>
          </div>
        </div>
        <div class="nav-center">
          <div class="nav-menu">
            <div
              v-for="item in navItems"
              :key="item.key"
              :class="['nav-item', { active: activeNav === item.key }]"
              @click="setActiveNav(item.key)"
            >
              <i :class="item.icon"></i>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div class="nav-right">
          <div class="nav-actions">
            <el-button type="text" class="action-btn">
              <i class="el-icon-bell"></i>
              <span>消息通知</span>
            </el-button>
            <el-dropdown @command="handleUserCommand" class="user-dropdown">
              <el-button type="text" class="user-btn">
                <i class="el-icon-user"></i>
                <span>{{ currentUser.username }}</span>
                <i class="el-icon-arrow-down"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">
                  <i class="el-icon-user"></i>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <i class="el-icon-setting"></i>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <i class="el-icon-switch-button"></i>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel height="200px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div
            class="banner-item"
            :style="{ backgroundImage: 'url(' + item.image + ')' }"
          >
            <div class="banner-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学习资源..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearch"
          ></el-button>
        </el-input>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="section-title">
        <h2>学习分类</h2>
      </div>
      <div class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="selectCategory(category)"
        >
          <div class="category-icon">
            <i :class="category.icon"></i>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-count">{{ category.count }}个资源</div>
        </div>
      </div>
    </div>

    <!-- 推荐资源 -->
    <div class="resources-section">
      <div class="section-title">
        <h2>{{ selectedCategory ? selectedCategory.name : "推荐资源" }}</h2>
        <div class="filter-tabs">
          <el-button
            v-for="filter in filters"
            :key="filter.key"
            :type="activeFilter === filter.key ? 'primary' : ''"
            size="small"
            @click="setFilter(filter.key)"
          >
            {{ filter.name }}
          </el-button>
        </div>
      </div>

      <div class="resources-grid">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="resource-card"
          @click="viewResource(resource)"
        >
          <div class="resource-image">
            <img :src="resource.image" :alt="resource.title" />
            <div class="resource-type">{{ resource.type }}</div>
          </div>
          <div class="resource-content">
            <h3 class="resource-title">{{ resource.title }}</h3>
            <p class="resource-description">{{ resource.description }}</p>
            <div v-if="resource.recommendationReason" class="recommend-reason">
              推荐依据：{{ resource.recommendationReason }}
            </div>
            <div class="resource-meta">
              <span class="resource-level">{{ resource.level }}</span>
              <span class="resource-duration">{{ resource.duration }}</span>
              <span class="resource-rating">
                <i class="el-icon-star-on"></i>
                {{ resource.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-section">
        <el-pagination
          @current-change="handlePageChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="totalCourses"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 用户学习统计 -->
    <div class="stats-section">
      <div class="section-title">
        <h2>学习统计</h2>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ userStats.completedCourses }}</div>
          <div class="stat-label">已完成课程</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.studyHours }}</div>
          <div class="stat-label">学习时长(小时)</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.certificates }}</div>
          <div class="stat-label">获得证书</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.currentStreak }}</div>
          <div class="stat-label">连续学习(天)</div>
        </div>
      </div>
    </div>

    <el-dialog
      title="完善个人资料"
      :visible.sync="profileDialogVisible"
      width="480px"
      :close-on-click-modal="!profileRequired"
      :close-on-press-escape="!profileRequired"
      :show-close="!profileRequired"
    >
      <el-form
        ref="profileForm"
        :model="studentProfileForm"
        :rules="studentProfileRules"
        label-width="90px"
      >
        <el-form-item label="学校" prop="school">
          <el-input
            v-model="studentProfileForm.school"
            maxlength="64"
            show-word-limit
            placeholder="请输入你的学校名称"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentProfileForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-input :value="studentProfileForm.created_at || '自动获取中...'" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="!profileRequired"
          @click="profileDialogVisible = false"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="profileSubmitting"
          @click="submitStudentProfile"
        >
          保存资料
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "LearningResources",
  data() {
    return {
      searchKeyword: "",
      selectedCategory: null,
      activeFilter: "all",
      activeNav: "home",
      currentUser: {},
      currentPage: 1,
      pageSize: 12,
      totalCourses: 0,
      allCoursesData: [], // 存储所有课程数据
      profileDialogVisible: false,
      profileRequired: false,
      profileSubmitting: false,
      studentProfileForm: {
        school: "",
        gender: "",
        created_at: "",
      },
      studentProfileRules: {
        school: [{ required: true, message: "请输入学校名称", trigger: "blur" }],
        gender: [{ required: true, message: "请选择性别", trigger: "change" }],
      },
      navItems: [
        { key: "home", name: "首页", icon: "el-icon-house" },
        { key: "courses", name: "课程", icon: "el-icon-reading" },
        { key: "practice", name: "实战", icon: "el-icon-cpu" },
        { key: "ai-assistant", name: "AI助手", icon: "el-icon-magic-stick" },
        { key: "community", name: "社区", icon: "el-icon-user" },
        { key: "resources", name: "资源", icon: "el-icon-folder-opened" },
      ],
      banners: [
        {
          id: 1,
          title: "AI智能学习助手",
          description: "个性化推荐，让学习更高效",
          image:
            "https://via.placeholder.com/800x200/667eea/ffffff?text=AI学习助手",
        },
        {
          id: 2,
          title: "编程技能提升",
          description: "从入门到精通，系统化学习路径",
          image:
            "https://via.placeholder.com/800x200/764ba2/ffffff?text=编程学习",
        },
        {
          id: 3,
          title: "数据科学课程",
          description: "掌握数据分析与机器学习",
          image:
            "https://via.placeholder.com/800x200/f093fb/ffffff?text=数据科学",
        },
      ],
      categories: [
        { id: 1, name: "编程开发", icon: "el-icon-monitor", count: 156 },
        { id: 2, name: "数据科学", icon: "el-icon-pie-chart", count: 89 },
        { id: 3, name: "人工智能", icon: "el-icon-cpu", count: 67 },
        { id: 4, name: "前端开发", icon: "el-icon-mobile-phone", count: 134 },
        { id: 5, name: "后端开发", icon: "el-icon-server", count: 98 },
        { id: 6, name: "移动开发", icon: "el-icon-phone", count: 76 },
        { id: 7, name: "云计算", icon: "el-icon-cloudy", count: 54 },
        { id: 8, name: "网络安全", icon: "el-icon-lock", count: 43 },
      ],
      filters: [
        { key: "all", name: "全部" },
        { key: "video", name: "视频课程" },
        { key: "article", name: "文章教程" },
        { key: "project", name: "实战项目" },
        { key: "book", name: "电子书籍" },
      ],
      resources: [
        {
          id: 1,
          title: "Vue.js 完整开发指南",
          description:
            "从零开始学习Vue.js，包含组件开发、路由管理、状态管理等核心概念",
          image:
            "https://via.placeholder.com/300x200/42b883/ffffff?text=Vue.js",
          type: "视频课程",
          level: "中级",
          duration: "12小时",
          rating: 4.8,
          category: 4,
        },
        {
          id: 2,
          title: "Python数据分析实战",
          description:
            "使用Python进行数据清洗、分析和可视化，掌握pandas、numpy等工具",
          image:
            "https://via.placeholder.com/300x200/3776ab/ffffff?text=Python",
          type: "实战项目",
          level: "高级",
          duration: "8小时",
          rating: 4.9,
          category: 2,
        },
        {
          id: 3,
          title: "机器学习算法详解",
          description: "深入理解机器学习核心算法，包含理论讲解和代码实现",
          image: "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=ML",
          type: "文章教程",
          level: "高级",
          duration: "15小时",
          rating: 4.7,
          category: 3,
        },
        {
          id: 4,
          title: "React Native移动开发",
          description: "使用React Native开发跨平台移动应用，一套代码多端运行",
          image: "https://via.placeholder.com/300x200/61dafb/ffffff?text=React",
          type: "视频课程",
          level: "中级",
          duration: "10小时",
          rating: 4.6,
          category: 6,
        },
        {
          id: 5,
          title: "Node.js后端开发",
          description: "构建高性能的Node.js后端服务，包含Express、数据库操作等",
          image:
            "https://via.placeholder.com/300x200/68a063/ffffff?text=Node.js",
          type: "实战项目",
          level: "中级",
          duration: "14小时",
          rating: 4.5,
          category: 5,
        },
        {
          id: 6,
          title: "Docker容器化部署",
          description: "学习Docker容器技术，实现应用的快速部署和扩展",
          image:
            "https://via.placeholder.com/300x200/2496ed/ffffff?text=Docker",
          type: "视频课程",
          level: "中级",
          duration: "6小时",
          rating: 4.4,
          category: 7,
        },
      ],
      userStats: {
        completedCourses: 12,
        studyHours: 156,
        certificates: 8,
        currentStreak: 15,
      },
    };
  },
  computed: {
    filteredResources() {
      // 从所有课程数据开始
      let filtered = this.allCoursesData.map((course) => ({
        id: course.id || Math.random(),
        title: course.title || course.name || "未命名课程",
        description: course.description || "暂无描述",
        image:
          course.image ||
          `https://via.placeholder.com/300x200/42b883/ffffff?text=${encodeURIComponent(course.title || "Course")}`,
        type: course.type || "视频课程",
        level: course.level || "中级",
        duration: course.duration || "未知",
        rating: course.rating || 0,
        category: this.getCategoryIdByName(course.category),
        recommendationReason: this.getRecommendationReason(course),
      }));

      // 按分类筛选
      if (this.selectedCategory) {
        filtered = filtered.filter(
          (resource) => resource.category === this.selectedCategory.id,
        );
      }

      // 按类型筛选
      if (this.activeFilter !== "all") {
        const filterMap = {
          video: "视频课程",
          article: "文章教程",
          project: "实战项目",
          book: "电子书籍",
        };
        filtered = filtered.filter(
          (resource) => resource.type === filterMap[this.activeFilter],
        );
      }

      // 按搜索关键词筛选
      if (this.searchKeyword) {
        filtered = filtered.filter(
          (resource) =>
            resource.title
              .toLowerCase()
              .includes(this.searchKeyword.toLowerCase()) ||
            resource.description
              .toLowerCase()
              .includes(this.searchKeyword.toLowerCase()),
        );
      }

      // 更新总数
      this.totalCourses = filtered.length;

      // 分页切片
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      return filtered.slice(start, end);
    },
  },
  mounted() {
    this.loadUserInfo();
    this.checkStudentProfileStatus();
    this.loadCoursesFromNeo4j();
  },
  methods: {
    authApiUrl(path) {
      const raw = process.env.API_BASE;
      const base =
        raw != null && String(raw).length > 0
          ? String(raw).replace(/\/$/, "")
          : "";
      const p = path.startsWith("/") ? path : `/${path}`;
      return base ? `${base}${p}` : p;
    },
    getAuthHeaders() {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    getRecommendationReason(course) {
      if (!course) return "";

      if (course.reason === "similar_users_preference") {
        const supporterCount = course.supporterCount || 0;
        const score =
          course.score != null && !Number.isNaN(Number(course.score))
            ? Number(course.score).toFixed(2)
            : null;
        if (score != null) {
          return `协同过滤：${supporterCount} 位相似用户对该课程有正向反馈（推荐分 ${score}，reason=similar_users_preference）`;
        }
        return `协同过滤：${supporterCount} 位相似用户对该课程有正向反馈（reason=similar_users_preference）`;
      }

      if (course.reason === "shortest_graph_path") {
        const pathLength =
          course.pathLength !== undefined && course.pathLength !== null
            ? course.pathLength
            : "未知";
        const pathNodes = Array.isArray(course.pathNodes)
          ? course.pathNodes.filter(Boolean).slice(0, 5)
          : [];
        if (pathNodes.length > 0) {
          return `最短路：你与课程的知识图谱最短路径为 ${pathLength} 跳（${pathNodes.join(" -> ")}，reason=shortest_graph_path）`;
        }
        return `最短路：你与课程的知识图谱最短路径为 ${pathLength} 跳（reason=shortest_graph_path）`;
      }

      if (course.reason === "shortest_graph_path_same_school") {
        const peerCount = course.peerCount || 0;
        const peerNames = Array.isArray(course.peerNames)
          ? course.peerNames.filter(Boolean).slice(0, 3)
          : [];
        if (peerNames.length > 0) {
          return `冷启动同校推荐：${peerCount} 位同校同学学习过该课程（例如：${peerNames.join("、")}，reason=shortest_graph_path_same_school）`;
        }
        return `冷启动同校推荐：${peerCount} 位同校同学学习过该课程（reason=shortest_graph_path_same_school）`;
      }

      if (course.reason === "popular_fallback") {
        return "热门兜底：基于课程评分与访问热度（reason=popular_fallback）";
      }

      return "";
    },
    loadUserInfo() {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    },
    async checkStudentProfileStatus() {
      if (!this.currentUser || this.currentUser.role === "admin") return;

      try {
        const response = await fetch(
          this.authApiUrl("/api/auth/student-profile/status"),
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          },
        );
        if (!response.ok) return;

        const result = await response.json();
        const status = result.data || {};
        if (!status.profileCompleted) {
          this.studentProfileForm.school = status.school || "";
          this.studentProfileForm.gender = status.gender || "";
          this.studentProfileForm.created_at =
            status.created_at || this.currentUser.created_at || "";
          this.profileRequired = true;
          this.profileDialogVisible = true;
        }
      } catch (error) {
        console.warn("检查学生资料状态失败:", error);
      }
    },
    async openProfileDialog() {
      if (!this.currentUser || this.currentUser.role === "admin") {
        this.$message.info("管理员无需填写学生资料");
        return;
      }

      this.profileRequired = false;
      this.studentProfileForm.created_at = this.currentUser.created_at || "";
      try {
        const response = await fetch(
          this.authApiUrl("/api/auth/student-profile/status"),
          {
            method: "GET",
            headers: this.getAuthHeaders(),
          },
        );
        if (response.ok) {
          const result = await response.json();
          const status = result.data || {};
          this.studentProfileForm.school = status.school || "";
          this.studentProfileForm.gender = status.gender || "";
          this.studentProfileForm.created_at =
            status.created_at ||
            this.studentProfileForm.created_at ||
            this.currentUser.created_at ||
            "";
        }
      } catch (error) {
        console.warn("拉取学生资料失败:", error);
      }

      this.profileDialogVisible = true;
    },
    submitStudentProfile() {
      if (!this.$refs.profileForm) return;

      this.$refs.profileForm.validate(async (valid) => {
        if (!valid) return;
        this.profileSubmitting = true;
        try {
          const response = await fetch(
            this.authApiUrl("/api/auth/student-profile"),
            {
              method: "POST",
              headers: this.getAuthHeaders(),
              body: JSON.stringify({
                school: this.studentProfileForm.school.trim(),
                gender: this.studentProfileForm.gender,
              }),
            },
          );
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.message || "保存资料失败");
          }

          this.studentProfileForm.created_at =
            (result.data && result.data.created_at) ||
            this.studentProfileForm.created_at;
          this.profileDialogVisible = false;
          this.profileRequired = false;
          this.currentUser.profileCompleted = true;
          localStorage.setItem("user", JSON.stringify(this.currentUser));
          this.$message.success("资料完善成功");
        } catch (error) {
          this.$message.error(error.message || "保存资料失败");
        } finally {
          this.profileSubmitting = false;
        }
      });
    },
    getCurrentUserId() {
      return this.currentUser.id || this.currentUser.student_id || null;
    },
    async fetchRecommendationByAlgorithm(algorithm, userId, limit = 50) {
      const endpoint =
        algorithm === "collaborative"
          ? `http://localhost:3000/api/neo4j/recommendations/collaborative/${encodeURIComponent(userId)}?limit=${limit}`
          : `http://localhost:3000/api/neo4j/recommendations/shortest-path/${encodeURIComponent(userId)}?limit=${limit}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`推荐接口请求失败: ${response.status}`);
      }
      return await response.json();
    },
    async loadCoursesFromNeo4j() {
      try {
        const userId = this.getCurrentUserId();
        if (userId != null) {
          try {
            const collaborativeResult =
              await this.fetchRecommendationByAlgorithm(
              "collaborative",
              userId,
              100,
              );
            const collaborativeData = collaborativeResult.data || [];

            // 协同过滤仅在非 fallback 时采用，否则继续尝试最短路
            if (
              collaborativeData.length > 0 &&
              collaborativeResult.fallback === false
            ) {
              this.allCoursesData = collaborativeData;
              this.$message.success(
                `已加载 ${collaborativeData.length} 条协同过滤推荐`,
              );
              return;
            }
          } catch (err) {
            console.warn("协同过滤推荐失败，尝试最短路径推荐:", err);
          }

          try {
            const shortestPathResult = await this.fetchRecommendationByAlgorithm(
              "shortest",
              userId,
              100,
            );
            const shortestPathData = shortestPathResult.data || [];
            if (
              shortestPathData.length > 0 &&
              shortestPathResult.fallback === false
            ) {
              this.allCoursesData = shortestPathData;
              this.$message.success(
                `已加载 ${shortestPathData.length} 条最短路径推荐`,
              );
              return;
            }

            if (
              shortestPathData.length > 0 &&
              shortestPathResult.fallback === true
            ) {
              console.warn("最短路径接口返回兜底结果，原因可能是图中无可达路径");
            }
          } catch (err) {
            console.warn("最短路径推荐失败，回退全量课程:", err);
          }
        }

        // 推荐失败时回退到全量课程
        const response = await fetch("http://localhost:3000/api/neo4j/course");
        if (!response.ok) {
          throw new Error("无法从Neo4j加载课程");
        }

        const result = await response.json();
        const allCourses = result.data || result;
        this.allCoursesData = allCourses;
        this.$message.success(`成功加载 ${allCourses.length} 个课程`);
      } catch (error) {
        console.error("Error loading courses:", error);
        this.$message.warning("加载课程失败，使用默认数据");
      }
    },
    async recordCourseInteraction(course, interactionType = "view") {
      const userId = this.getCurrentUserId();
      if (userId == null || !course || !course.id) return;

      try {
        await fetch("http://localhost:3000/api/neo4j/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            courseId: course.id,
            interactionType,
          }),
        });
      } catch (error) {
        console.warn("记录课程交互失败:", error);
      }
    },
    getCategoryIdByName(categoryName) {
      const categoryMap = {
        编程开发: 1,
        数据科学: 2,
        人工智能: 3,
        前端开发: 4,
        后端开发: 5,
        移动开发: 6,
        云计算: 7,
        网络安全: 8,
      };
      return categoryMap[categoryName] || 1;
    },
    setActiveNav(navKey) {
      this.activeNav = navKey;
      this.$message.info(
        "切换到: " + this.navItems.find((item) => item.key === navKey).name,
      );
    },
    handleUserCommand(command) {
      switch (command) {
        case "profile":
          this.openProfileDialog();
          break;
        case "settings":
          this.$message.info("设置功能开发中...");
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
      })
        .then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          this.$message.success("已退出登录");
          this.$router.push("/login");
        })
        .catch(() => {
          // 用户取消退出
        });
    },
    handleSearch() {
      // 搜索逻辑已在computed中实现
      console.log("搜索关键词:", this.searchKeyword);
    },
    selectCategory(category) {
      this.selectedCategory =
        this.selectedCategory && this.selectedCategory.id === category.id
          ? null
          : category;
      this.activeFilter = "all";
    },
    setFilter(filterKey) {
      this.activeFilter = filterKey;
    },
    viewResource(resource) {
      this.$message.success("正在打开: " + resource.title);
      this.recordCourseInteraction(resource, "view");
      // 这里可以跳转到资源详情页面
    },
    handlePageChange(page) {
      this.currentPage = page;
      // filteredResources 计算属性会自动更新
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
.learning-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0;
  overflow-y: auto;
}

/* 横向导航栏样式 */
.horizontal-nav {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
}

.nav-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.nav-left .logo i {
  font-size: 24px;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  gap: 40px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
  color: #666;
}

.nav-item:hover {
  color: #409eff;
  background: #f0f9ff;
}

.nav-item.active {
  color: #409eff;
  background: #e1f5fe;
}

.nav-item i {
  font-size: 20px;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}

.nav-right .nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-btn {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-btn:hover {
  color: #409eff;
}

.user-dropdown {
  margin-left: 10px;
}

.user-btn {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.user-btn:hover {
  color: #409eff;
  background: #f0f9ff;
}

/* 调整其他区域的padding */
.banner-section,
.search-section,
.category-section,
.resources-section,
.stats-section {
  padding: 0 20px;
}

.banner-section {
  padding-top: 20px;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 30px;
}

.banner-item {
  height: 200px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.banner-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 1;
}

.banner-content h3 {
  font-size: 28px;
  margin-bottom: 10px;
}

.banner-content p {
  font-size: 16px;
  opacity: 0.9;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  text-align: center;
  padding-top: 20px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  font-size: 16px;
}

/* 分类网格 */
.category-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.category-item {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 10px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.category-count {
  font-size: 14px;
  color: #666;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 10px;
}

/* 资源网格 */
.resources-section {
  margin-bottom: 40px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.resource-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.resource-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.resource-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-type {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.resource-content {
  padding: 20px;
}

.resource-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.resource-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.recommend-reason {
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f5f7ff;
  color: #4a56a8;
  font-size: 12px;
  line-height: 1.5;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.resource-level {
  background: #e1f5fe;
  color: #0277bd;
  padding: 2px 6px;
  border-radius: 3px;
}

.resource-duration {
  color: #666;
}

.resource-rating {
  color: #ff9800;
}

/* 统计区域 */
.stats-section {
  margin-bottom: 40px;
}

/* 分页样式 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}
</style>
/* 响应式设计 */ @media (max-width: 768px) { .nav-container { padding: 0 15px; }
.nav-menu { gap: 20px; } .nav-item { padding: 6px 12px; } .nav-item i {
font-size: 18px; } .nav-item span { font-size: 12px; } .nav-actions { gap: 10px;
} .action-btn { font-size: 12px; } } @media (max-width: 480px) { .nav-menu {
gap: 15px; } .nav-item span { display: none; } .nav-left .logo span { display:
none; } .action-btn span { display: none; } } /* 用户下拉菜单响应式 */ @media
(max-width: 480px) { .user-btn span { display: none; } .user-btn { padding: 8px;
} }
