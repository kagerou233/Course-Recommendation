import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

// 路由守卫函数
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem("token");
  if (token) {
    next();
  } else {
    next("/login");
  }
};

const router = new VueRouter({
  mode: "history",
  linkActiveClass: "is-active",
  scrollBehavior: () => ({
    y: 0,
  }),
  routes: [
    {
      path: "/",
      redirect: (to) => {
        // 根据用户角色重定向到不同页面
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.role === "admin" ? "/admin" : "/learning";
        }
        return "/login";
      },
    },
    {
      name: "login",
      path: "/login",
      component: () => import("../views/Login"),
    },
    {
      name: "learning",
      path: "/learning",
      component: () => import("../views/LearningResources"),
      beforeEnter: requireAuth,
    },
    {
      name: "main",
      path: "/main",
      component: () => import("../views/Main"),
      beforeEnter: requireAuth,
    },
    {
      name: "admin",
      path: "/admin",
      component: () => import("../views/admin/AdminLayout"),
      beforeEnter: requireAuth,
      redirect: "/admin/resources",
      children: [
        {
          name: "admin-resources",
          path: "resources",
          component: () => import("../views/admin/ResourceManagement"),
        },
        {
          name: "admin-users",
          path: "users",
          component: () => import("../views/admin/UserManagement"),
        },
        {
          name: "admin-categories",
          path: "categories",
          component: () => import("../views/admin/CategoryManagement"),
          meta: { title: "分类管理" },
        },
        {
          name: "admin-tags",
          path: "tags",
          component: () => import("../views/admin/PlaceholderPage"),
          meta: { title: "标签管理" },
        },
        {
          name: "admin-roles",
          path: "roles",
          component: () => import("../views/admin/PlaceholderPage"),
          meta: { title: "角色权限" },
        },
        {
          name: "admin-feedback",
          path: "feedback",
          component: () => import("../views/admin/PlaceholderPage"),
          meta: { title: "用户反馈" },
        },
        {
          name: "admin-analytics",
          path: "analytics",
          component: () => import("../views/admin/PlaceholderPage"),
          meta: { title: "数据统计" },
        },
        {
          name: "admin-settings",
          path: "settings",
          component: () => import("../views/admin/PlaceholderPage"),
          meta: { title: "系统设置" },
        },
        {
          name: "admin-neo4j",
          path: "neo4j",
          component: () => import("../views/neo4j"),
          meta: { title: "Neo4j可视化" },
        },
      ],
    },
    {
      path: "/neo4j",
      redirect: "/admin/neo4j",
    },
  ],
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (to.path === "/login") {
    // 如果已登录，根据角色重定向到对应页面
    if (token && userStr) {
      const user = JSON.parse(userStr);
      const redirectPath = user.role === "admin" ? "/admin" : "/learning";
      next(redirectPath);
    } else {
      next();
    }
  } else {
    // 其他页面需要登录
    if (token) {
      // 检查用户权限
      if (userStr) {
        const user = JSON.parse(userStr);

        // 管理员可以访问所有页面
        if (user.role === "admin") {
          next();
        }
        // 普通用户只能访问学习资源页面
        else if (user.role === "user") {
          if (to.path === "/learning") {
            next();
          } else {
            next("/learning");
          }
        } else {
          next();
        }
      } else {
        next();
      }
    } else {
      next("/login");
    }
  }
});

export default router;
