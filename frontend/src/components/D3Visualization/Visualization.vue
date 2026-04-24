<template>
  <div
    :style="[
      {
        width: '100%',
        height: '75vh',
        'padding-top': '10px',
        display: 'block',
      },
      extendStyle,
    ]"
  >
    <ExplorerComponent
      ref="ExplorerComponent"
      :maxNeighbours="maxNeighbours"
      :initialNodeDisplay="initialNodeDisplay"
      :graphStyleData="graphStyleData"
      :updateStyle="updateStyle"
      :getNeighbours="getNeighbours"
      :getNeighboursAll="getNeighboursAll"
      :nodes="state.nodesAndRelationships.nodes"
      :relationships="state.nodesAndRelationships.relationships"
      :fullscreen="fullscreen"
      :frameHeight="frameHeight"
      :assignVisElement="assignVisElement"
      :getAutoCompleteCallback="
        (callback) => {
          this.autoCompleteCallback = callback;
        }
      "
      :setGraph="setGraph"
      @clickNode="handleClickNode"
      @toggleFullscreen="handleToggleFullscreen"
    ></ExplorerComponent>
  </div>
</template>
<script type="text/ecmascript-6">
import bolt from './services/bolt/bolt'
import ExplorerComponent from './components/Explorer'
import { dim } from './constants'
import Vue from 'vue'
import { setting } from 'config/index'
var neo4j = require('neo4j-driver')
export default{

  data(){
    return{
      dim: dim,
      state: {
        nodesAndRelationships: {
          nodes: [],
          relationships: []
        },
        justInitiated: true
      },
      graphStyleData: {},
      frameHeight: 500,
      graph: {}
    }
  },
  props: {
    clearAll: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    extendStyle: {
      type: Object,
      default() {
        return {}
      }
    },
    maxNeighbours: {
      type: Number,
      default: 1000
    },
    initialNodeDisplay: '',
    assignVisElement: Function,
    records: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  components:{
    ExplorerComponent
  },
  created() {
  },
  mounted() {
    let me = this;
    this.frameHeight = $(this.$el).height() * 1.2;
    console.log("neo4j", neo4j)
    console.log("Visualization 组件已挂载");
    console.log("maxNeighbours:", this.maxNeighbours);

    setting.neo4jUrl = "bolt://localhost:7687";
    setting.neo4jUserName = "neo4j";
    setting.neo4jPassword = "neo4j1234";

    this.driver = neo4j.driver(setting.neo4jUrl, neo4j.auth.basic(setting.neo4jUserName, setting.neo4jPassword));

    console.log("Neo4j Driver 已创建:", this.driver);
    console.log("getNeighbours 方法:", this.getNeighbours);

    me.componentWillMount();
  },
  methods: {
    handleClickNode(item) {
      this.$emit('clickNode', item);
    },
    handleToggleFullscreen(isFullscreen) {
      console.log('Visualization.vue - handleToggleFullscreen 被调用');
      console.log('isFullscreen:', isFullscreen);
      this.$emit('toggleFullscreen', isFullscreen);
    },
    updateStyle(graphStyleData) {
      if (JSON.stringify(graphStyleData) == JSON.stringify(this.graphStyleData)) return;

      let inlineGraphStyleData = {};
      for (let nodeKey in this.graphStyleData) {
        inlineGraphStyleData[nodeKey] = this.graphStyleData[nodeKey];
      }

      for (var nodeKey in graphStyleData) {
        let node = inlineGraphStyleData[nodeKey];
        if (!node) node = {};
        for (var propKey in graphStyleData[nodeKey]) {
          node[propKey] = graphStyleData[nodeKey][propKey];
        }

        inlineGraphStyleData[nodeKey] = node;
      }

      this.graphStyleData = inlineGraphStyleData;
      this.$refs.ExplorerComponent.reloadPanel();
    },
    componentWillMount () {
      if (this.records && this.records.length > 0) {
        this.populateDataToStateFromProps(this)
      }
    },

    shouldComponentUpdate (nextProps) {
      return nextProps.extendStyle !== this.extendStyle ||
        nextProps.records !== this.records ||
        nextProps.graphStyleData !== this.graphStyleData
    },

    populateDataToStateFromProps (props) {
      Vue.set(this.state, 'nodesAndRelationships', bolt.extractNodesAndRelationshipsFromRecordsForOldVis(props.records));
    },

    mergeToList (list1, list2) {
      return list1.concat(list2.filter(itemInList2 => list1.findIndex(itemInList1 => itemInList1.id === itemInList2.id) < 0))
    },

    autoCompleteRelationships (existingNodes, newNodes) {
      if (this.autoComplete) {
        const existingNodeIds = existingNodes.map(node => parseInt(node.id))
        const newNodeIds = newNodes.map(node => parseInt(node.id))

        this.getInternalRelationships(existingNodeIds, newNodeIds)
          .then((graph) => {
            this.autoCompleteCallback && this.autoCompleteCallback(graph.relationships)
          })
          .catch((e) => {})
      }
    },

    getNeighbours (id, currentNeighbourIds = []) {
      const numericId = parseInt(String(id), 10)
      if (Number.isNaN(numericId)) {
        return Promise.reject(new Error("Invalid node id for expand"))
      }

      const exclude = (currentNeighbourIds || [])
        .map((x) => parseInt(String(x), 10))
        .filter((x) => !Number.isNaN(x))
        .map((x) => neo4j.int(x))

      const limit = Math.max(0, this.maxNeighbours - exclude.length)
      if (limit === 0) {
        return Promise.resolve({ nodes: [], relationships: [], count: 0 })
      }

      // 修复：使用 COUNT {} 替代 size() 以兼容新版本 Neo4j
      const query = `
        MATCH path = (a)--(o)
        WHERE id(a) = $nid
          AND NOT id(o) IN $exclude
        WITH path, a, o
        RETURN path, COUNT { (a)--() } AS c
        ORDER BY id(o)
        LIMIT $lim
      `

      const session = this.driver.session()
      return session
        .run(query, {
          nid: neo4j.int(numericId),
          exclude,
          lim: neo4j.int(limit),
        })
        .then((result) => {
          let count = 0
          if (result.records.length > 0) {
            const c = result.records[0].get("c")
            count = neo4j.isInt(c) ? c.toNumber() : parseInt(String(c), 10) || 0
          }
          const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
            result.records,
            false
          )
          const existing = this.graph && this.graph._nodes ? this.graph._nodes : []
          this.autoCompleteRelationships(existing, resultGraph.nodes)
          return { ...resultGraph, count }
        })
        .catch((error) => {
          console.error("getNeighbours / 展开节点失败:", error)
          throw error
        })
        .finally(() => {
          session.close()
        })
    },

    getNeighboursAll (id, currentNeighbourIds = []) {
      const numericId = parseInt(String(id), 10)
      if (Number.isNaN(numericId)) {
        return Promise.reject(new Error("Invalid node id for expand all"))
      }

      const exclude = (currentNeighbourIds || [])
        .map((x) => parseInt(String(x), 10))
        .filter((x) => !Number.isNaN(x))
        .map((x) => neo4j.int(x))

      // 修复：使用 COUNT {} 替代 size() 以兼容新版本 Neo4j
      const query = `
        MATCH path = (a)--(o)
        WHERE id(a) = $nid
          AND NOT id(o) IN $exclude
        WITH path, a, o
        RETURN path, COUNT { (a)--() } AS c
        ORDER BY id(o)
      `

      const session = this.driver.session()
      return session
        .run(query, {
          nid: neo4j.int(numericId),
          exclude
        })
        .then((result) => {
          let count = 0
          if (result.records.length > 0) {
            const c = result.records[0].get("c")
            count = neo4j.isInt(c) ? c.toNumber() : parseInt(String(c), 10) || 0
          }
          const resultGraph = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
            result.records,
            false
          )
          const existing = this.graph && this.graph._nodes ? this.graph._nodes : []
          this.autoCompleteRelationships(existing, resultGraph.nodes)
          return { ...resultGraph, count }
        })
        .catch((error) => {
          console.error("getNeighboursAll / 展开所有节点失败:", error)
          throw error
        })
        .finally(() => {
          session.close()
        })
    },

    getInternalRelationships (existingNodeIds, newNodeIds) {
      const newInts = newNodeIds.map((x) => bolt.neo4j.int(parseInt(x, 10)))
      const existingInts = existingNodeIds.map((x) => bolt.neo4j.int(parseInt(x, 10)))
      const mergedInts = existingInts.concat(newInts)
      const query =
        "MATCH (a)-[r]->(b) WHERE id(a) IN $mergedIds AND id(b) IN $newIds RETURN r"
      const session = this.driver.session()

      return session
        .run(query, { mergedIds: mergedInts, newIds: newInts })
        .then((result) => {
          return {
            ...bolt.extractNodesAndRelationshipsFromRecordsForOldVis(
              result.records,
              false
            ),
          }
        })
        .catch(() => {
          return { nodes: [], relationships: [] }
        })
        .finally(() => {
          session.close()
        })
    },

    setGraph (graph) {
      this.graph = graph
      this.autoCompleteRelationships([], this.graph._nodes)
    }
  },
  watch: {
    records: {
      handler: function(val, oldVal) {
        this.populateDataToStateFromProps(this);
      },
      deep: true
    },
    state: {
      handler: function(val, oldVal) {
      },
      deep: true
    },
    'extendStyle.display': {
      handler: function(val, oldVal) {
        Vue.set(this.state, 'justInitiated', false);
      },
      deep: true
    },
    clearAll: {
      handler: function(val, oldVal) {
        if (val) {
          this.$refs.ExplorerComponent.reloadPanel(true);
        }
      }
    }
  }
}
</script>
<style></style>
