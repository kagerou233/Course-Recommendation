<template>
  <div class="resource-management">
    <div class="filter-bar">
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
      <el-select
        v-model="filterCategory"
        placeholder="选择分类"
        class="filter-select"
      >
        <el-option label="全部分类" value=""></el-option>
        <el-option label="编程开发" value="programming"></el-option>
        <el-option label="数据科学" value="data-science"></el-option>
        <el-option label="人工智能" value="ai"></el-option>
        <el-option label="前端开发" value="frontend"></el-option>
      </el-select>
      <el-select
        v-model="filterStatus"
        placeholder="选择状态"
        class="filter-select"
      >
        <el-option label="全部状态" value=""></el-option>
        <el-option label="已发布" value="published"></el-option>
        <el-option label="草稿" value="draft"></el-option>
        <el-option label="已下线" value="offline"></el-option>
      </el-select>
    </div>

    <div class="data-table">
      <el-table :data="filteredResources" style="width: 100%">
        <el-table-column prop="title" label="资源名称" min-width="250">
          <template slot-scope="scope">
            <div class="resource-info">
              <img
                :src="scope.row.image"
                :alt="scope.row.title"
                class="resource-thumb"
              />
              <div class="resource-details">
                <div class="resource-title">{{ scope.row.title }}</div>
                <div class="resource-category">
                  {{ scope.row.category }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="难度" width="80">
          <template slot-scope="scope">
            <el-tag :type="getLevelTagType(scope.row.level)" size="small">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="views"
          label="浏览量"
          width="80"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
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
                type="success"
                @click="handleView(scope.row)"
                >查看</el-button
              >
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
        :total="totalResources"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResourceManagement",
  data() {
    return {
      searchKeyword: "",
      filterCategory: "",
      filterStatus: "",
      currentPage: 1,
      pageSize: 10,
      totalResources: 0,
      allResourcesData: [],
    };
  },
  computed: {
    filteredResources() {
      let filtered = this.allResourcesData.map((course) => ({
        id: course.id || Math.random(),
        title: course.title || course.name || "未命名课程",
        category: course.category || "未分类",
        type: course.type || "视频课程",
        level: course.level || "中级",
        status: course.status || "已发布",
        views: course.views || 0,
        createTime:
          course.createTime ||
          new Date().toISOString().slice(0, 16).replace("T", " "),
        image:
          course.image ||
          `https://via.placeholder.com/60x40/42b883/ffffff?text=${encodeURIComponent(course.title || "Course")}`,
      }));

      if (this.searchKeyword) {
        filtered = filtered.filter(
          (resource) =>
            resource.title
              .toLowerCase()
              .includes(this.searchKeyword.toLowerCase()) ||
            resource.category
              .toLowerCase()
              .includes(this.searchKeyword.toLowerCase()),
        );
      }

      if (this.filterCategory) {
        filtered = filtered.filter(
          (resource) => resource.category === this.filterCategory,
        );
      }

      if (this.filterStatus) {
        filtered = filtered.filter(
          (resource) => resource.status === this.filterStatus,
        );
      }

      this.totalResources = filtered.length;

      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      return filtered.slice(start, end);
    },
  },
  mounted() {
    this.loadResourcesFromNeo4j();
  },
  methods: {
    async loadResourcesFromNeo4j() {
      try {
        const response = await fetch("http://localhost:3000/api/neo4j/course");
        if (response.ok) {
          const result = await response.json();
          const allCourses = result.data || result;
          this.allResourcesData = allCourses;
          this.$message.success(`成功加载 ${allCourses.length} 个课程资源`);
        } else {
          console.error("Failed to fetch courses from Neo4j");
          this.$message.warning("无法从Neo4j加载课程");
        }
      } catch (error) {
        console.error("Error loading courses:", error);
        this.$message.warning("加载课程失败");
      }
    },
    handleSearch() {
      // 搜索逻辑在computed中实现
    },
    handleEdit(row) {
      this.$message.info("编辑: " + row.title);
    },
    handleView(row) {
      this.$message.info("查看: " + row.title);
    },
    async handleDelete(row) {
      try {
        const confirmed = await this.$confirm(
          `确定要删除课程"${row.title}"吗？此操作不可恢复！`,
          "删除确认",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
          },
        );

        if (confirmed) {
          const response = await fetch(
            `http://localhost:3000/api/neo4j/course/${encodeURIComponent(row.id)}`,
            {
              method: "DELETE",
            },
          );

          if (response.ok) {
            const result = await response.json();

            if (result.success) {
              this.$message.success("课程删除成功");

              const index = this.allResourcesData.findIndex(
                (course) =>
                  String(course.id) === String(row.id) ||
                  String(course.课程ID) === String(row.id),
              );

              if (index !== -1) {
                this.allResourcesData.splice(index, 1);
              }

              if (this.filteredResources.length === 0 && this.currentPage > 1) {
                this.currentPage--;
              }
            } else {
              this.$message.error(result.message || "删除失败");
            }
          } else {
            if (response.status === 404) {
              this.$message.error("课程不存在或已被删除");
            } else {
              const errorText = await response.text();
              console.error("删除失败:", errorText);
              this.$message.error(`删除失败: ${response.status}`);
            }
          }
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除课程失败:", error);
          this.$message.error("删除课程时发生错误");
        }
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    getTypeTagType(type) {
      const typeMap = {
        视频课程: "primary",
        实战项目: "success",
        文章教程: "info",
        电子书籍: "warning",
      };
      return typeMap[type] || "";
    },
    getLevelTagType(level) {
      const levelMap = {
        初级: "success",
        中级: "warning",
        高级: "danger",
      };
      return levelMap[level] || "";
    },
    getStatusTagType(status) {
      const statusMap = {
        已发布: "success",
        草稿: "info",
        已下线: "danger",
      };
      return statusMap[status] || "";
    },
  },
};
</script>

<style scoped>
.resource-management {
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

.resource-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resource-thumb {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.resource-details {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-category {
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
