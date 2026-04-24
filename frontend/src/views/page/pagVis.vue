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
        <!--width,height 画布的宽度，高度。 可以是百分比或像素，一般在dom元素上设置 -->
        <div id="network_id" ref="network_id" class="network" style="height: 100%;"></div>

      </el-col>
    </el-row>


  </el-row>
</template>
<script>
var neo4j = require("neo4j-driver");

const Vis = require('vis-network/dist/vis-network.min');
require('vis-network/dist/dist/vis-network.min.css');

export default {
  data() {
    return {
      viz: "",
      // Vis,
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
        this.executeCypher(newData);
      },
      immediate: true,
      deep: true
    },
  },
  methods: {
    // 重置
    onSubmit() {


    },

    // vis.js画图
    visDraw() {
      this.fullscreenLoading = true
      let container = this.$refs.network_id;
      let data = { nodes: this.nodesArray, edges: this.edgesArray }
      console.log("🚀 ~ file: pageKnowlegGraph.vue ~ line 135 ~ visDraw ~ data", data)
      let options = {
        autoResize: true,
        // / 设置节点样式
        nodes: {
          shape: "dot",
          size: 20,
          font: {
            //字体配置
            size: 20
          },
          color: {
            // border: "#2B7CE9", //节点边框颜色
            background: "#97C2FC", //节点背景颜色
            highlight: {
              //节点选中时状态颜色
              border: "#2B7CE9",
              background: "#D2E5FF"
            },
            hover: {
              //节点鼠标滑过时状态颜色
              border: "#2B7CE9",
              background: "#D2E5FF"
            }
          },
          borderWidth: 0, //节点边框宽度，单位为px
          borderWidthSelected: 2 //节点被选中时边框的宽度，单位为px
        },
        // 边线配置
        edges: {
          width: 1,
          length: 260,
          color: {
            color: "#848484",
            highlight: "#848484",
            hover: "#848484",
            inherit: "from",
            opacity: 1.0
          },
          shadow: false,
          smooth: {
            //设置两个节点之前的连线的状态
            enabled: false //默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
          },
          arrows: { to: true } //箭头指向to
        },
        //计算节点之前斥力，进行自动排列的属性
        physics: {
          // enabled: true, //默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
          // barnesHut: {
          //   gravitationalConstant: -4000,
          //   centralGravity: 0.3,
          //   springLength: 120,
          //   springConstant: 0.04,
          //   damping: 0.09,
          //   avoidOverlap: 0
          // },

        },
        // physics: false,
        //用于所有用户与网络的交互。处理鼠标和触摸事件以及导航按钮和弹出窗口
        interaction: {
          hover: true,
          dragNodes: true, //是否能拖动节点
          dragView: true, //是否能拖动画布
          // hover: true, //鼠标移过后加粗该节点和连接线
          // multiselect: true, //按 ctrl 多选
          // selectable: true, //是否可以点击选择
          // selectConnectedEdges: true, //选择节点后是否显示连接线
          // hoverConnectedEdges: true, //鼠标滑动节点后是否显示连接线
          zoomView: true //是否能缩放画布
        },

      };
      this.network = new Vis.Network(container, data, options);
      // console.log("🚀 ~ file: pageKnowlegGraph.vue ~ line 304 ~ this.network.on ~  this.network", this.network)
      this.fullscreenLoading = false

    },

    /**
     * 直接执行Cypher
     */
    executeCypher(query) {
      this.fullscreenLoading = true
      this.echartsData = []  //节点数组
      this.echartsNode = []  //节点数组
      this.edgesArray = [] //关系线数组
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
        // 开始处理数据
        let nodes = new Set();
        for (let i = 0; i < me.records.length; i++) {
          nodes.add(me.records[i]._fields[0].segments[0].start.properties.name);
          nodes.add(me.records[i]._fields[0].segments[0].end.properties.name);
          this.edgesArray.push({
            from: me.records[i]._fields[0].segments[0].start.properties.name,
            to: me.records[i]._fields[0].segments[0].end.properties.name,
            // label: me.records[i]._fields[0].segments[0].relationship.type,
            // id: i,
          });
        }

        nodes.forEach((e) => {
          this.nodesArray.push({
            label: e,
            id: e,
          });
        })

        session.close();
        me.closeLoading(false);
      }).catch(function (error) {
        console.log("Cypher 执行失败！", error);
        me.driver.close();
      });


      setTimeout(() => {

        this.fullscreenLoading = false
        this.visDraw()
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
