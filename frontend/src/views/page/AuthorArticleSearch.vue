<template>
  <div class="box">
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
import { Visualization } from "components/D3Visualization";
import Search from "components/Search";
import { setting } from "config/index";
// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "AuthorArticleSearch",
  components: { Visualization, Search },
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
      "bolt://120.0.0.1:7687",
      neo4j.auth.basic("neo4j", "neo4j1234")
    );
    console.log(
      "🚀 ~ file: AuthorArticleSearch.vue ~ line 46 ~ mounted ~  this.drive",
      this.driver
    );
  },
  created() {},

  methods: {
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

      session
        .run(query, {})
        .then(function (result) {
          me.clearAll = false;
          me.records = result.records;
          console.log("neo4j 结果", result.records);
          let nodes = new Set();
          var nodesRelation = [];
          for (let i = 0; i < me.records.length; i++) {
            const segments = me.records[i]._fields[0].segments[0];
            if (segments) {
              nodes.add(segments.start.properties.name);
              nodes.add(segments.end.properties.name);
              nodesRelation.push({
                source: segments.start.properties.name,
                target: segments.end.properties.name,
                lineStyle: {
                  curveness: 0,
                },
                label: {
                  show: true,
                  formatter: function () {
                    return segments.relationship.type;
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
  },
};
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  flex-direction: column;
}

/* 可视化组件 */
.search {
  /* flex-grow: 1; */
  width: 100%;
  height: 10vh;
}

.show {
  /* flex-grow: 250; */
  width: 100%;
  height: 90vh;
}
</style>
