<template>
  <el-row class="LayOutBody">
    <!-- 查询条件 -->
    <el-row class="SearchHeader">
      <el-col :span="20" style="margin-top:5px;">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="查询语句">
            <el-input v-model="searchForm.policyCata"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="4">
        <div style="float:right;">
          <el-button type="primary" @click="executeCypher(searchForm.policyCata)">查 询</el-button>
          <el-button @click="onSubmit">重 置</el-button>
        </div>
      </el-col>
    </el-row>
    <!-- 主页面 -->
    <el-row class="MainArea">
      <el-col :span="24" class="Mainleft" v-loading="fullscreenLoading">
        <knowlegGraph ref="knowlegGraph" v-if="knowlegGraphshow" :data="echartsNode" :links="nodesRelation" :category="category" :globalData="globalData"></knowlegGraph>
      </el-col>
    </el-row>


  </el-row>
</template>
<script>

import knowlegGraph from "../echarts/knowlegGraph.vue";
var neo4j = require("neo4j-driver");

export default {
  components: {
    knowlegGraph
  },
  data() {
    return {
      viz: "",

      SQL: "MATCH p=()-->() RETURN p",
      knowlegGraphshow: false,

      // 查询条件form数据
      searchForm: {
        policyCata: 'MATCH p=()-->() RETURN p'
      },


      globalData: [], //用来存放被收起的某节点的子节点


      nodesArray: [],  //节点数组
      edgesArray: [],  //关系线数组



      driver: null,
      cypherkeyword: false,
      graphtable: false,
      records: [],
      clearAll: false,

      echartsData: [],
      echartsNode: [],
      category: [],
      nodesRelation: [],
      currentGraph: {
        nodes: {},
        links: {},
      },
      nodeMap: {},
      network: '',

      fullscreenLoading: false
    }
  },
  created() {
    // setTimeout(() => {
    //   this.queryInfo()
    // }, 800);
  },

  mounted() {
    // this.draw();
    this.executeCypher(this.SQL);

  },
  watch: {
    SQL: {
      handler(newData) {
        // this.draw();

      },
      immediate: true,
      deep: true
    },
  },
  methods: {
    // 重置
    onSubmit() {


    },

    /**
     * 直接执行Cypher
     */
    executeCypher(query) {
      this.fullscreenLoading = true
      this.echartsData = []  //节点数组
      this.echartsNode = []  //节点数组
      this.nodesRelation = [] //关系线数组
      this.category = [] //关系线数组
      // this.nodesArray = []  //节点数组
      // this.edgesArray = [] //关系线数组
      this.knowlegGraphshow = false
      // 创建实例
      this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'KG1234'));
      console.log("🚀 ~ file: AuthorArticleSearch.vue ~ line 46 ~ mounted ~  this.drive", this.driver)

      let me = this;
      me.records = [];
      this.clearAll = true;
      let session = this.driver.session();
      if (query == "") return;
      session.run(query, {}).then((result) => {
        me.clearAll = false;
        me.records = result.records;
        // console.log("neo4j 结果", result.records);
        // let nodes = new Set();

        // 开始处理数据
        for (let i = 0; i < me.records.length; i++) {
          this.echartsData.push({
            name: me.records[i]._fields[0].segments[0].start.properties.name,
            category: me.records[i]._fields[0].segments[0].start.labels[0]
          });
          this.echartsData.push({
            name: me.records[i]._fields[0].segments[0].end.properties.name,
            category: me.records[i]._fields[0].segments[0].end.labels[0]
          });

          this.nodesRelation.push({
            source: me.records[i]._fields[0].segments[0].start.properties.name,
            target: me.records[i]._fields[0].segments[0].end.properties.name,
            name: me.records[i]._fields[0].segments[0].relationship.type,
          });
        }

        //删除arr中的重复对象
        var arrId = [];
        var legend = [];
        for (var item of this.echartsData) {
          legend.push({ name: item.category })
          if (arrId.indexOf(item.name) == -1) {
            arrId.push(item.name)
            this.echartsNode.push(item);
          }
        }

        this.category = Array.from(new Set(legend))

        session.close();
        me.closeLoading(false);
      }).catch(function (error) {
        console.log("Cypher 执行失败！", error);
        me.driver.close();
      });


      setTimeout(() => {
        console.log("neo4j 处理结果", this.nodesRelation);
        console.log("neo4j edgesArray", this.echartsNode);
        this.knowlegGraphshow = true
        this.fullscreenLoading = false
      }, 4000);

    },
    closeLoading(status) {
      console.log('closeLoading', status);
      // this.$refs.Search.setLoading(status);
    },



    queryInfo() {
      // this.basePolicyDeviationList()
    },


  }
}
</script>
<style scoped>
.LayOutBody {
  width: 100%;
  height: 100%;
  border: 10px solid #EAECEF;
}

/* 头部搜索条件 */
.SearchHeader {
  height: 72px;
  border-bottom: 8px solid #EAECEF;
  background: #ffffff;
  padding: 9px 22px;
}

/* 主体部分 */
.MainArea {
  height: 92.4%;
  border-bottom: 10px solid #EAECEF;
  background: #EAECEF;
}

.Mainleft {
  /* width: 66%; */
  height: 100%;
  background: #ffffff;
}

.Vis {
  position: relative;
}

.menu {
  /*这个样式不写，右键弹框会一直显示在画布的左下角*/
  position: absolute;
  background: rgba(3, 3, 3, 0.6);
  border-radius: 5px;
  left: -99999px;
  top: -999999px;
  color: #fff;
  padding: 5px;
}

.LayOutBody {
  overflow-x: visible !important;
}

.headerTop {
  display: flex;
  justify-content: space-between;
}

.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px;
}

body>.el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.WordExplains {
  display: flex;
  justify-content: left;
  font-size: 0.8rem;
}

.Wordname {
  white-space: nowrap;
}

.WordContent {
  margin-left: 5px;
}

.left {
  width: 100%;
  height: 100%;
  /* margin-bottom: 1.5vh; */
  border-top: 1px solid rgb(212, 212, 212);
  border-bottom: 1px solid rgb(202, 202, 202);
  background-color: #fff;
  /* padding: 0 10px 0 10px; */
  overflow: hidden;
}
</style>
