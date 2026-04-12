<template>
  <div class="category-management">
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学科名称..."
        class="search-input"
        clearable
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearch"
        ></el-button>
      </el-input>
      <el-button type="primary" icon="el-icon-refresh" @click="loadCategories">
        刷新
      </el-button>
    </div>

    <div class="data-table">
      <el-table :data="filteredCategories" style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div class="sub-table-wrapper" v-if="scope.row.subDisciplines && scope.row.subDisciplines.length">
              <div class="sub-table-title">子学科</div>
              <el-table
                :data="scope.row.subDisciplines"
                size="mini"
                class="sub-table"
              >
                <el-table-column prop="name" label="名称" min-width="180">
                  <template slot-scope="sub">
                    <el-tag size="mini" type="info">{{ sub.row.name }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="courseCount"
                  label="课程数量"
                  width="100"
                  align="center"
                >
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="sub-table-empty">暂无子学科</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="学科名称" min-width="220">
          <template slot-scope="scope">
            <div class="category-name">
              <el-tag size="medium">{{ scope.row.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="courseCount"
          label="课程数量"
          width="120"
          align="center"
        >
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button size="mini" @click="openEditDialog(scope.row)">
                重命名
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      title="重命名学科"
      :visible.sync="editDialogVisible"
      width="420px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="当前名称">
          <el-input v-model="editForm.oldName" disabled></el-input>
        </el-form-item>
        <el-form-item label="新名称">
          <el-input
            v-model="editForm.newName"
            placeholder="请输入新的学科名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateCategory">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "CategoryManagement",
  data() {
    return {
      allCategories: [],
      searchKeyword: "",
      editDialogVisible: false,
      editForm: {
        oldName: "",
        newName: "",
      },
    };
  },
  computed: {
    filteredCategories() {
      let list = [...this.allCategories];

      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        list = list.filter((item) => {
          const nameMatch = (item.name || "").toLowerCase().includes(keyword);
          const subMatch = (item.subDisciplines || []).some((sub) =>
            (sub.name || "").toLowerCase().includes(keyword),
          );
          return nameMatch || subMatch;
        });
      }

      return list;
    },
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/neo4j/disciplines",
        );
        if (!response.ok) {
          this.$message.error("加载分类失败");
          return;
        }
        const result = await response.json();
        const data = result.data || result;
        this.allCategories = data;
        this.$message.success(`已加载 ${data.length} 个学科`);
      } catch (error) {
        console.error("加载分类失败:", error);
        this.$message.error("加载分类时发生错误");
      }
    },
    handleSearch() {
      // 过滤逻辑在 computed 中
    },
    openEditDialog(row) {
      this.editForm.oldName = row.name;
      this.editForm.newName = row.name;
      this.editDialogVisible = true;
    },
    async handleUpdateCategory() {
      const { oldName, newName } = this.editForm;
      if (!newName || newName.trim() === "") {
        this.$message.warning("新学科名称不能为空");
        return;
      }
      if (newName === oldName) {
        this.$message.info("学科名称没有变化");
        this.editDialogVisible = false;
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/neo4j/disciplines",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ oldName, newName }),
          },
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("更新分类失败:", text);
          this.$message.error("更新分类失败");
          return;
        }

        const result = await response.json();
        if (result.success) {
          this.$message.success(
            `学科名称更新成功，受影响的学科节点数：${result.updatedCount}`,
          );
          this.editDialogVisible = false;
          this.loadCategories();
        } else {
          this.$message.error(result.message || "更新分类失败");
        }
      } catch (error) {
        console.error("更新分类失败:", error);
        this.$message.error("更新分类时发生错误");
      }
    },
  },
};
</script>

<style scoped>
.category-management {
  padding: 24px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 260px;
  max-width: 380px;
}

.data-table {
  margin-top: 4px;
}

.category-name {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}
</style>

