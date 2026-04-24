<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>基于知识图谱的学习资源系统</h2>
        <p>{{ activeTab === "login" ? "请登录您的账户" : "注册新账户（学生角色）" }}</p>
      </div>

      <el-tabs v-model="activeTab" class="auth-tabs" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form
            :model="loginForm"
            :rules="loginRules"
            ref="loginForm"
            class="login-form"
            @submit.native.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="用户名"
                prefix-icon="el-icon-user"
                size="large"
              ></el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="el-icon-lock"
                size="large"
                @keyup.enter.native="handleLogin"
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="login-btn"
              >
                {{ loading ? "登录中..." : "登录" }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form
            :model="registerForm"
            :rules="registerRules"
            ref="registerForm"
            class="login-form"
            @submit.native.prevent="handleRegister"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名（2～32 位，字母数字下划线或中文）"
                prefix-icon="el-icon-user"
                size="large"
              ></el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码（至少 6 位）"
                prefix-icon="el-icon-lock"
                size="large"
              ></el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="el-icon-lock"
                size="large"
                @keyup.enter.native="handleRegister"
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="registerLoading"
                @click="handleRegister"
                class="login-btn"
              >
                {{ registerLoading ? "注册中..." : "注册" }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      activeTab: "login",
      loginForm: {
        username: "",
        password: "",
      },
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
      },
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
      },
      registerRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 2, max: 32, message: "用户名长度为 2～32 位", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validateConfirm, trigger: "blur" },
        ],
      },
      loading: false,
      registerLoading: false,
    };
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

    async postAuth(path, body) {
      let response;
      try {
        response = await fetch(this.authApiUrl(path), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (e) {
        throw new Error(
          "无法连接认证服务。请在 server 目录执行 npm start，并确认监听 http://localhost:3000"
        );
      }

      const text = await response.text();
      let result = {};
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error(
            "认证接口返回了网页而非数据，通常是后端未启动或地址不对。请启动 server（npm start）后重试。"
          );
        }
      }

      if (!response.ok) {
        throw new Error(result.message || `请求失败（${response.status}）`);
      }
      return result;
    },

    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;

          // 调用登录API
          this.login(this.loginForm)
            .then((result) => {
              this.$message.success("登录成功");
              // 根据用户角色跳转到不同页面
              const redirectPath =
                result.user.role === "admin" ? "/admin" : "/learning";
              this.$router.push(redirectPath);
            })
            .catch((error) => {
              this.$message.error(error.message || "登录失败");
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },

    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.registerLoading = true;
          this.register(this.registerForm)
            .then((result) => {
              this.$message.success("注册成功，已自动登录");
              const redirectPath =
                result.user.role === "admin" ? "/admin" : "/learning";
              this.$router.push(redirectPath);
            })
            .catch((error) => {
              this.$message.error(error.message || "注册失败");
            })
            .finally(() => {
              this.registerLoading = false;
            });
        }
      });
    },

    async login(loginData) {
      const result = await this.postAuth("/api/auth/login", {
        username: loginData.username,
        password: loginData.password,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      return result;
    },

    async register(form) {
      const result = await this.postAuth("/api/auth/register", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      return result;
    },
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input--large .el-input__inner {
  height: 45px;
  line-height: 45px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.el-input--large .el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.auth-tabs >>> .el-tabs__header {
  margin-bottom: 24px;
}

.auth-tabs >>> .el-tabs__item {
  font-size: 15px;
}
</style>
