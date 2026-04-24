<template>
  <div class="search">
    <div class="search-input">
      <el-cascader
        style="width: 300px"
        :options="options"
        placeholder="选择搜索语句"
        @change="handleChange"
      />
      <el-input
        v-model="keyword"
        style="width: 600px"
        placeholder="输入查询语句"
      ></el-input>
      <el-button type="primary" @click="SubmitOne" :loading="loading"
        >搜索</el-button
      >
    </div>
    <!-- <div class="search-input">
      <el-input
        v-model="content.name"
        style="width: 200px"
        placeholder="实体名称"
      ></el-input>
      <el-input
        v-model="content.depth"
        style="width: 200px"
        placeholder="查询深度，默认1"
      ></el-input>
      <el-input
        v-model="content.num"
        style="width: 200px"
        placeholder="查询节点数量，默认25"
      ></el-input>
      <el-button type="primary" @click="SubmitTwo" :loading="loading"
        >搜索</el-button
      >
    </div> -->
  </div>
</template>
<script>
export default {
  name: "Search",
  components: {},
  props: {
    condition: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      content: {
        name: null, //实体名称
        depth: null, //深度
        num: null, //数量
      },
      keyword: "MATCH (n:`Course`) RETURN n LIMIT 25",
      switchval: false,
      cypherval: false,
      loading: false,
      options: [
        {
          value: "nodeLabels",
          label: "实体",
          children: [
            {
              value: "MATCH (n:`Course`) RETURN n LIMIT 25",
              label: "课程",
            },
            {
              value: "MATCH (n:`Teacher`) RETURN n LIMIT 25",
              label: "教师",
            },
            {
              value: "MATCH (n:`Student`) RETURN n LIMIT 25",
              label: "学生",
            },
          ],
        },
        {
          value: "relationshipTypes",
          label: "关联",
          children: [
            {
              value: "MATCH p=()-->() RETURN p LIMIT 25",
              label: "全部有向关系",
            },
            {
              value:
                "MATCH p=(t:Teacher)-[r:`CREATED_BY`]->(c:Course) RETURN p LIMIT 25",
              label: "教师-课程",
            },
            {
              value:
                "MATCH p=(t:Student)-[r:ENROLLED_IN]->(c:Course) RETURN p LIMIT 25",
              label: "学生-课程",
            },
          ],
        },
      ],
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
    switchval(val) {
      this.$emit("CypherKeyword", val);
    },
    cypherval(val) {
      this.$emit("GraphTeble", val);
    },
  },
  mounted() {},
  created() {},

  methods: {
    handleChange(value) {
      this.keyword = value[1];
    },
    SubmitOne() {
      this.setLoading(true);
      this.$emit("Submit", this.keyword);
    },
    SubmitTwo() {
      const name = this.content.name;
      const depth = this.content.depth ? this.content.depth : 1;
      const num = this.content.num ? this.content.num : 25;

      const cypher = `MATCH p = (n { name:'${name}'})-[* 0..${depth}] - () RETURN p limit ${num}`;
      this.keyword = cypher;
      this.SubmitOne();
    },
    setLoading(status) {
      this.loading = status;
    },
  },
};
</script>

<style scoped>
/* 搜索组件 */
.search {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 6px rgba(0, 0, 0, 0.04);
  border-width: 2px;
}

.search .search-input {
  flex-grow: 6;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04); */
}

.search .search-submit {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

.search .search-switch {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}
</style>
