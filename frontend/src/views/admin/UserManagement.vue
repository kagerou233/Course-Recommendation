<template>
  <div class="user-management">
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户..."
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
      <el-select
        v-model="filterRole"
        placeholder="选择角色"
        class="filter-select"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="学生" value="student"></el-option>
      </el-select>
      <el-select
        v-model="filterStatus"
        placeholder="选择状态"
        class="filter-select"
      >
        <el-option label="全部状态" value=""></el-option>
        <el-option label="正常" value="active"></el-option>
        <el-option label="禁用" value="disabled"></el-option>
      </el-select>
    </div>

    <div class="data-table">
      <el-table :data="filteredUsers" style="width: 100%">
        <el-table-column prop="username" label="用户名" min-width="150">
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar
                :size="40"
                :src="scope.row.avatar"
                :style="{ backgroundColor: scope.row.avatarColor }"
              >
                {{ scope.row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ scope.row.username }}</div>
                <div class="user-email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag type="primary" size="small">学生</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === 'active' ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.status === "active" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="课程数" width="80">
          <template slot-scope="scope">
            {{ scope.row.coursesCount }}
          </template>
        </el-table-column>
        <el-table-column
          prop="loginCount"
          label="登录次数"
          width="90"
        ></el-table-column>
        <el-table-column
          prop="lastLogin"
          label="最后登录"
          width="170"
        ></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button size="mini" @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                :type="scope.row.status === 'active' ? 'warning' : 'success'"
                @click="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === "active" ? "禁用" : "启用" }}
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserManagement",
  data() {
    return {
      searchKeyword: "",
      filterRole: "",
      filterStatus: "",
      currentPage: 1,
      pageSize: 10,
      totalUsers: 0,
      allUsersData: [],
    };
  },
  computed: {
    filteredUsers() {
      let filtered = [...this.allUsersData];

      if (this.searchKeyword) {
        filtered = filtered.filter(
          (user) =>
            user.username
              .toLowerCase()
              .includes(this.searchKeyword.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchKeyword.toLowerCase()),
        );
      }

      if (this.filterRole) {
        filtered = filtered.filter((user) => user.role === this.filterRole);
      }

      if (this.filterStatus) {
        filtered = filtered.filter((user) => user.status === this.filterStatus);
      }

      this.totalUsers = filtered.length;

      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      return filtered.slice(start, end);
    },
  },
  mounted() {
    this.loadUsersData();
  },
  methods: {
    async loadUsersData() {
      try {
        const response = await fetch("http://localhost:3000/api/neo4j/users");
        if (response.ok) {
          const result = await response.json();
          const allUsers = result.data || result;

          const avatarColors = [
            "#409EFF",
            "#67C23A",
            "#E6A23C",
            "#F56C6C",
            "#909399",
            "#5470C6",
            "#91CC75",
            "#FAC858",
          ];
          this.allUsersData = allUsers.map((user, index) => ({
            ...user,
            avatar: "",
            avatarColor: avatarColors[index % avatarColors.length],
          }));

          this.$message.success(`成功加载 ${allUsers.length} 个用户`);
        } else {
          console.error("Failed to fetch users from Neo4j");
          this.$message.warning("无法从Neo4j加载用户");
        }
      } catch (error) {
        console.error("Error loading users:", error);
        this.$message.warning("加载用户失败");
      }
    },
    handleSearch() {
      // 搜索逻辑在computed中实现
    },
    handleEdit(user) {
      this.$message.info("编辑用户: " + user.username);
    },
    handleToggleStatus(user) {
      const newStatus = user.status === "active" ? "disabled" : "active";
      const action = newStatus === "active" ? "启用" : "禁用";

      this.$confirm(`确定要${action}用户"${user.username}"吗？`, "确认操作", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          user.status = newStatus;
          this.$message.success(`用户已${action}`);
        })
        .catch(() => {
          // 用户取消
        });
    },
    handleDelete(user) {
      this.$confirm(
        `确定要删除用户"${user.username}"吗？此操作不可恢复！`,
        "删除确认",
        {
          confirmButtonText: "确定删除",
          cancelButtonText: "取消",
          type: "warning",
        },
      )
        .then(async () => {
          try {
            const response = await fetch(
              `http://localhost:3000/api/neo4j/users/${encodeURIComponent(user.id)}`,
              {
                method: "DELETE",
              },
            );

            if (response.ok) {
              const result = await response.json();

              if (result.success) {
                this.$message.success("用户删除成功");

                const index = this.allUsersData.findIndex(
                  (u) => u.id === user.id,
                );
                if (index !== -1) {
                  this.allUsersData.splice(index, 1);
                }

                if (this.filteredUsers.length === 0 && this.currentPage > 1) {
                  this.currentPage--;
                }
              } else {
                this.$message.error(result.message || "删除失败");
              }
            } else {
              if (response.status === 404) {
                this.$message.error("用户不存在或已被删除");
              } else {
                const errorText = await response.text();
                console.error("删除失败:", errorText);
                this.$message.error(`删除失败: ${response.status}`);
              }
            }
          } catch (error) {
            console.error("删除用户失败:", error);
            this.$message.error("删除用户时发生错误");
          }
        })
        .catch(() => {
          // 用户取消
        });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
  },
};
</script>

<style scoped>
.user-management {
  padding: 24px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.filter-select {
  width: 140px;
}

.data-table {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
}

.action-buttons {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
