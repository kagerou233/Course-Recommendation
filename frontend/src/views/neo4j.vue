<template>
  <div class="box">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <!-- <svg-icon icon-class="peoples" class-name="card-panel-icon" /> -->
            <i class="el-icon-s-grid card-panel-icon"></i>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">课程实体数量</div>
            <count-to
              :start-val="0"
              :end-val="indicator.entity"
              :duration="2600"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-dict">
            <!-- <svg-icon icon-class="dict" class-name="card-panel-icon" /> -->
            <i class="el-icon-s-promotion card-panel-icon"></i>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">实体类型数量</div>
            <count-to
              :start-val="0"
              :end-val="indicator.entityType"
              :duration="3000"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-table">
            <!-- <svg-icon icon-class="table" class-name="card-panel-icon" /> -->
            <i class="el-icon-share card-panel-icon"></i>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">关系类型数量</div>
            <count-to
              :start-val="0"
              :end-val="indicator.relationshipType"
              :duration="3200"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <!-- <svg-icon icon-class="message" class-name="card-panel-icon" /> -->
            <i class="el-icon-s-promotion card-panel-icon"></i>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">三元组数量</div>
            <count-to
              :start-val="0"
              :end-val="indicator.triple"
              :duration="3600"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- <div class="tip">
      <span class="tip_item">
        <div>实体数量</div>
        <div>{{ indicator.entity }}</div>
      </span>
      <span class="tip_item">
        <div>实体类型数量</div>
        <div>{{ indicator.entityType }}</div>
      </span>
      <span class="tip_item">
        <div>关系类型数量</div>
        <div>{{ indicator.relationshipType }}</div>
      </span>
      <span class="tip_item">
        <div>三元组数量</div>
        <div>{{ indicator.triple }}</div>
      </span>
    </div> -->
    <div class="search">
      <Search
        ref="Search"
        @Submit="Submit"
        @CypherKeyword="CypherKeyword"
        @GraphTeble="GraphTeble"
      />
    </div>
    <div class="show">
      <Visualization
        @clickNode="handleClickNode"
        :records="records"
        :clearAll="clearAll"
      ></Visualization>
    </div>
  </div>
</template>
<script>
import CountTo from "vue-count-to";
import { Visualization } from "components/D3Visualization";
import Search from "components/Search";
import { setting } from "config/index";
// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "AuthorArticleSearch",
  components: { Visualization, Search, CountTo },
  props: {
    condition: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      driver: null,
      cypherkeyword: false,
      graphtable: false,
      records: [],
      clearAll: false,
      echartsData: [],
      nodesRelation: [],
      indicator: {
        entity: 0,
        entityType: 0,
        relationshipType: 0,
        triple: 0,
      },
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
  },
  mounted() {
    this.driver = neo4j.driver(
      "bolt://localhost:7687",
      neo4j.auth.basic("neo4j", "neo4j1234"),
    );
    console.log(
      "🚀 ~ file: AuthorArticleSearch.vue ~ line 46 ~ mounted ~  this.drive",
      this.driver,
    );
    this.getIndicator();
  },
  created() {},

  methods: {
    async getIndicator() {
      try {
        let sessionA = this.driver.session();
        let sessionB = this.driver.session();
        let sessionC = this.driver.session();
        let sessionD = this.driver.session();

        let resultA = await sessionA.run("MATCH (n) RETURN count(n)", {});
        sessionA.close();

        let resultB = await sessionB.run("CALL db.labels()", {});
        sessionB.close();

        let resultC = await sessionC.run(
          "MATCH (n)-[r]->() RETURN COUNT(r)",
          {},
        );
        sessionC.close();

        let resultD = await sessionD.run("MATCH ()-[r]-() RETURN count(r)", {});
        sessionD.close();

        this.indicator = {
          entity: resultA.records[0]._fields[0].low,
          entityType: resultB.records.length,
          relationshipType: resultC.records[0]._fields[0].low,
          triple: resultD.records[0]._fields[0].low,
        };
      } catch (error) {
        console.error("Error occurred:", error);
      }
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClickNode() {},
    Submit(query) {
      console.log("Submit", query);
      // let query = "MATCH (n:Author) RETURN n LIMIT 25";
      // if (this.cypherkeyword) {
      this.executeCypher(query);
      // } else {
      //TODO:关键词搜搜
      // }
    },
    CypherKeyword(data) {
      this.cypherkeyword = data;
    },
    GraphTeble(data) {
      this.graphtable = data;
    },
    /**
     * 直接执行Cypher
     */
    executeCypher(query) {
      let me = this;
      me.records = [];
      this.clearAll = true;
      let session = this.driver.session();

      if (query == "") return;

      console.log("123", query);

      session
        .run(query, {})
        .then(function (result) {
          me.clearAll = false;
          me.records = result.records;
          console.log("neo4j 结果", result);
          let nodes = new Set();
          var nodesRelation = [];
          for (let i = 0; i < me.records.length; i++) {
            const segments = me.records[i]._fields[0].segments;
            if (segments && segments.length > 0) {
              nodes.add(
                me.records[i]._fields[0].segments[0].start.properties.name,
              );
              nodes.add(
                me.records[i]._fields[0].segments[0].end.properties.name,
              );
              nodesRelation.push({
                source:
                  me.records[i]._fields[0].segments[0].start.properties.name,
                target:
                  me.records[i]._fields[0].segments[0].end.properties.name,
                lineStyle: {
                  curveness: 0,
                },
                label: {
                  show: true,
                  formatter: function () {
                    return me.records[i]._fields[0].segments[0].relationship
                      .type;
                  },
                },
              });
            }
          }
          let curveness = [0, 0.4, -0.4, 0.3, -0.3, 0.2, -0.2, 0.1, -0.1];
          for (let j = 0; j < nodesRelation.length; j++) {
            let repeatNumber = 0;
            for (let s = j + 1; s < nodesRelation.length; s++) {
              let r1 = nodesRelation[j];
              let r2 = nodesRelation[s];
              if (r1.source === r2.source && r1.target === r2.target) {
                repeatNumber = repeatNumber + 1;
              } else if (r1.target === r2.source && r1.source === r2.target) {
                repeatNumber = repeatNumber + 1;
              }
            }
            nodesRelation[j].repeatNumber = repeatNumber;
          }
          for (let j = 0; j < nodesRelation.length; j++) {
            // console.log(nodesRelation[j].repeatNumber);
            nodesRelation[j].lineStyle.curveness =
              curveness[nodesRelation[j].repeatNumber];
          }

          var echartsData = [];
          nodes.forEach((e) => {
            let index = Math.ceil(Math.random() * 10);
            let color = () => {
              if (index % 4 === 0) {
                return "#228B22";
              } else if (index % 4 === 1) {
                return "#FFFF00";
              } else if (index % 4 === 2) {
                return "#20B2AA";
              } else if (index % 4 === 3) {
                return "#FFB6C1";
              }
              return "#87CEFA";
            };
            echartsData.push({
              name: e,
              x: Math.random() * 100,
              y: Math.random() * 100,
              itemStyle: {
                color: color(),
              },
            });
          });

          console.log("neo4j 处理结果", nodesRelation);
          console.log("neo4j 处理结果echartsData", echartsData);
          session.close();
          me.closeLoading(false);
        })
        .catch(function (error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },

    closeLoading(status) {
      console.log("closeLoading", status);
      this.$refs.Search.setLoading(status);
    },
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.$router.push('/login');
      }).catch(() => {
        // 取消退出登录
      });
    }
  },
};
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
}

.tip {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 99999;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}

.tip_item {
  display: block;
  padding: 10px;
}

.panel-group {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 90%;
  margin-left: 5% !important;
  flex-shrink: 0;
}

.card-panel-col {
  margin-bottom: 16px;
}

.card-panel {
  height: 90px;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  overflow: hidden;
  color: #666;
  /* background: rgb(254, 248, 239); */
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.05);
}

.card-panel &:hover .card-panel-icon-wrapper {
  color: #fff;
}

.card-panel &:hover .icon-people {
  background: #40c9c6;
}

.card-panel &:hover .icon-dict {
  background: #36a3f7;
}

.card-panel &:hover .icon-table {
  background: #f4516c;
}

.card-panel &:hover .icon-message {
  background: #34bfa3;
}

.icon-people {
  color: #40c9c6;
}

.icon-dict {
  color: #36a3f7;
}

.icon-table {
  color: #f4516c;
}

.icon-message {
  color: #34bfa3;
}

.card-panel-icon-wrapper {
  float: left;
  margin: 10px 0 0 10px;
  padding: 12px;
  transition: all 0.38s ease-out;
  border-radius: 6px;
}

.card-panel-icon {
  float: left;
  font-size: 40px;
}

.card-panel-description {
  float: right;
  font-weight: bold;
  margin: 20px;
  margin-left: 0px;
}

.card-panel-text {
  line-height: 18px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  margin-bottom: 8px;
}

.card-panel-num {
  font-size: 18px;
}

/* 可视化组件 */
.search {
  width: 100%;
  height: 80px;
  flex-shrink: 0;
}

.show {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
