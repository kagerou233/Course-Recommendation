<template>
  <el-row class="LayOutBody">
    <!-- 主页面 -->
    <el-row class="MainArea">
      <el-col :span="24" class="Mainleft" v-loading="fullscreenLoading">
        <div class="left" id="viz1" ref="viz1"></div>

      </el-col>
    </el-row>


  </el-row>
</template>
<script>
import NeoVis from 'neovis.js';

export default {

  data() {
    return {
      viz: "",

      SQL: "MATCH p=()-->() RETURN p",

      driver: null,
      cypherkeyword: false,
      graphtable: false,
      records: [],
      clearAll: false,

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
  },

  mounted() {
    this.draw();
  },
  watch: {
    SQL: {
      handler(newData) {
        this.draw();
      },
      immediate: true,
      deep: true
    },
  },
  methods: {

    draw(sql) {
      //  this.canvas = document.getElementById("js-canvas");
      var viz1 = this.$refs.viz1;
      var viz;
      console.log(viz1);

      var config = {
        container_id: "viz1",
        server_url: "bolt://localhost:7687",
        server_user: "neo4j",
        server_password: "KG1234",

        labels: {
          // "CITY": { caption: "name", community: "#5496FF", size: 200, font: { size: 35, color: "#606266", }, },
        },
        relationships: {
          // "待遇政策": { thickness: 1, caption: true, font: { size: 15, color: "#606266", }, },
        },
        arrows: true,



        initial_cypher: this.SQL,
      };

      viz = new NeoVis(config);
      viz._container = viz1;
      viz.render();
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
