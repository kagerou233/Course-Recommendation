<template>
  <StyledSvgWrapper>
    <svg class="neod3viz" ref="graphInit" />
    <div
      v-if="true"
      class="control-buttons"
      style="
        position: fixed;
        right: 20px;
        bottom: 60px;
        z-index: 1000;
        pointer-events: auto;
        display: flex;
        flex-direction: row-reverse;
        gap: 10px;
      "
    >
      <div
        style="
          font-size: 25px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        "
        :class="[state.zoomInLimitReached ? 'faded zoom-in' : 'zoom-in']"
        @click="zoomInClicked"
        title="放大"
      >
        <i class="el-icon-zoom-in" />
      </div>
      <div
        style="
          font-size: 25px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        "
        :class="[state.zoomOutLimitReached ? 'faded zoom-out' : 'zoom-out']"
        @click="zoomOutlicked"
        title="缩小"
      >
        <i class="el-icon-zoom-out" />
      </div>
      <div
        style="
          font-size: 25px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        "
        class="fullscreen-btn"
        @click="toggleFullscreen"
        :title="isFullscreen ? '退出全屏' : '全屏显示'"
      >
        <i :class="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'" />
      </div>
    </div>
  </StyledSvgWrapper>
</template>
<script type="text/ecmascript-6">
import { StyledSvgWrapper } from './styled'
import { createGraph, mapNodes, mapRelationships, getGraphStats } from '../mapper'
import { GraphEventHandler } from '../GraphEventHandler'
import { dim } from '../constants'
import '../lib/visualization/index'
import Vue from 'vue'

export default {
  data() {
    return {
      state: {
        zoomInLimitReached: true,
        zoomOutLimitReached: false
      },
      isFullscreen: false
    }
  },
  components: {
    StyledSvgWrapper
  },
  props: {
    fullscreen: {
      type: Boolean,
      default: false
    },
    frameHeight: {
      type: Number,
      default: 0
    },
    nodes: {
      type: Array,
      default() {
        return []
      }
    },
    relationships: {
      type: Array,
      default() {
        return []
      }
    },
    graphStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    onItemMouseOver: Function,
    getNodeNeighbours: Function,
    onItemSelect: Function,
    onGraphModelChange: Function,
    getAutoCompleteCallback: Function,
    assignVisElement: Function
  },
  created() {
  },
  mounted() {
    this.graphInit();
    this.componentDidMount();
    let _this = this
    document.addEventListener('DOMContentLoaded', function () {
      // 获取所有具有 'neod3viz' 类的元素
      var neod3vizElements = document.querySelectorAll('.neod3viz');

      // 遍历每个元素，为其添加鼠标滚轮事件监听器
      neod3vizElements.forEach(function (element) {
        element.addEventListener('wheel', function (event) {
          // 阻止默认的滚动行为
          event.preventDefault();

          // 检查滚动方向
          var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
          if (delta < 0) { //向下滚动
            // 在这里执行向下滚动时的操作
            _this.zoomOutlicked(event)
          } else { //向上滚动
            // 在这里执行向上滚动时的操作
            _this.zoomInClicked(event)

          }
        });
      });
    });

  },
  updated() {
    this.componentDidUpdate();
  },
  methods: {
    reloadPanel(forceReload) {
      if (forceReload && this.graph) {
        this.graph.resetGraph()
      }
      this.componentDidMount();
    },
    graphInit() {
      this.svgElement = this.$refs.graphInit;
    },

    zoomInClicked(el) {
      let limits = this.graphView.zoomIn(el);
      Vue.set(this.state, 'zoomInLimitReached', limits.zoomInLimit);
      Vue.set(this.state, 'zoomOutLimitReached', limits.zoomOutLimit);
    },

    zoomOutlicked(el) {
      let limits = this.graphView.zoomOut(el);
      Vue.set(this.state, 'zoomInLimitReached', limits.zoomInLimit);
      Vue.set(this.state, 'zoomOutLimitReached', limits.zoomOutLimit);
    },

    toggleFullscreen() {
      console.log('Graph.vue - toggleFullscreen 被调用');
      console.log('当前 isFullscreen:', this.isFullscreen);
      this.isFullscreen = !this.isFullscreen;
      console.log('新的 isFullscreen:', this.isFullscreen);
      console.log('触发 toggleFullscreen 事件');
      this.$emit('toggleFullscreen', this.isFullscreen);
    },

    zoomOutlicked(el) {
      let limits = this.graphView.zoomOut(el);
      Vue.set(this.state, 'zoomInLimitReached', limits.zoomInLimit);
      Vue.set(this.state, 'zoomOutLimitReached', limits.zoomOutLimit);
    },

    getVisualAreaHeight() {
      let areaHeight = 0;
      if (this.frameHeight && this.fullscreen) {
        areaHeight = this.frameHeight - (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2)
      } else {
        areaHeight = this.frameHeight - (dim.frameStatusbarHeight + dim.frameTitlebarHeight * 2) || this.svgElement.parentNode.offsetHeight
      }

      if (areaHeight < 0) {
        areaHeight = 0 - areaHeight;
      }
      return areaHeight;
    },

    componentDidMount() {
      if (this.svgElement != null) {

        if (!this.graphView) {
          let NeoConstructor = neo.graphView
          let measureSize = () => {
            return { width: this.svgElement.offsetWidth, height: this.getVisualAreaHeight() }
          }

          this.graph = createGraph(this.nodes, this.relationships)
          this.graphView = new NeoConstructor(this.svgElement, measureSize, this.graph, this.graphStyle)

          new GraphEventHandler(this.graph,
            this.graphView,
            this.getNodeNeighbours,
            this.onItemMouseOver,
            this.onItemSelect,
            this.onGraphModelChange
          ).bindEventHandlers()
          this.graphView.resize()
          this.graphView.update()

          this.state.currentStyleRules = this.graphStyle.toString()
          this.onGraphModelChange(getGraphStats(this.graph))
        } else {
          this.graphView.update()
          this.state.currentStyleRules = this.graphStyle.toString()
        }

        this.graph && this.setGraph && this.setGraph(this.graph)
        this.getAutoCompleteCallback && this.getAutoCompleteCallback(this.addInternalRelationships.bind(this))
        this.assignVisElement && this.assignVisElement(this.svgElement, this.graphView)
      }
    },

    addInternalRelationships(internalRelationships) {
      if (this.graph) {
        this.graph.addInternalRelationships(mapRelationships(internalRelationships, this.graph))
        this.graphView.update()
      }
    },

    componentDidUpdate() {
      if (this.state.shouldResize) {
        this.graphView.resize()
      }
    }
  },
  watch: {
    nodes: {
      handler: function (val, oldVal) {
        if (oldVal.toString() !== val.toString() && this.graphView) {
          this.graph.addNodes(mapNodes(val))
          this.graphView.update()
          this.onGraphModelChange(getGraphStats(this.graph))
        }
      },
      deep: true
    },
    relationships: {
      handler: function (val, oldVal) {
        if (oldVal.toString() !== val.toString() && this.graphView) {
          this.graph.addRelationships(mapRelationships(val, this.graph))
          this.graphView.update()
          this.onGraphModelChange(getGraphStats(this.graph))
        }
      },
      deep: false
    },
    graphStyle: {
      handler: function (val, oldVal) {
        if (this.graphView) {
          this.graphView.update()
          Vue.set(this.state, 'currentStyleRules', val.toString());
        }
      },
      deep: false
    },
    fullscreen: {
      handler: function (val, oldVal) {
        Vue.set(this.state, 'shouldResize', true);
      }
    },
    frameHeight: {
      handler: function (val, oldVal) {
        Vue.set(this.state, 'shouldResize', true);
      }
    }
  }
}
</script>

<style scoped>
/* 确保按钮容器始终在最上层 */
.zoom-in,
.zoom-out,
.fullscreen-btn {
  transition: all 0.2s ease;
}

.zoom-in:hover,
.zoom-out:hover,
.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1);
}

.faded {
  opacity: 0.3;
  cursor: not-allowed !important;
}

.faded:hover {
  transform: none !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

/* 控制按钮容器 */
.control-buttons {
  display: flex;
  flex-direction: row-reverse;
  gap: 10px;
}

.zoom-in,
.zoom-out,
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}
</style>
