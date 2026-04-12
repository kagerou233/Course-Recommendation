<template>
    <div>
        <el-empty v-if="isEmpty" :image-size="130" description="暂无数据"></el-empty>
        <div class="binzhouMap">
            <div ref="graph" style="height:89.8vh; width:83.8vw;"></div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isEmpty: false,
            options: {}, // 定义颜色
            mapcharts: '',
            tableData: [],
            // globalData: [], //用来存放被收起的某节点的子节点

            currentGraph: {
                nodes: {},
                links: {},
            },
            nodeMap: {},

        };
    },
    props: {
        id: {
            type: String,
            default: "chart",
        },
        data: {
            type: Array,
        },
        links: {
            type: Array,
        },
        category: {
            type: Array,
        },
        globalData: {
            type: Array,
        },
        chartsHeight: String,
        year: String,

    },
    created() {

    },


    // 通过不同id获取各个图表实例，并为每个图标的点击事件通过id匹配对应的方法，调用对应弹框
    mounted() {

        this.init()
    },

    methods: {
        init() {
            // 根据定义的常量，产生currentGraph的默认数据
            // 遍历全部nodes和links，产生node映射map
            this.redrawGraph();
        },
        // 根据更新后的option重新画图
        redrawGraph() {
            // 销毁实例
            if (this.mapcharts) {
                this.mapcharts.clear()
            }
            this.mapcharts = this.$echarts.init(this.$refs.graph);

            this.options = {
                tooltip: {//弹窗
                    show: false,
                },
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    left: 10,
                    top: 20,
                    bottom: 20,
                    data: this.category
                },
                series: [
                    {

                        categories: this.category,
                        // categories: [{
                        //     name: "筹资渠道"
                        // }],
                        type: "graph",
                        layout: "force",
                        zoom: 0.6,
                        symbolSize: 60,
                        // 节点是否可以拖动
                        draggable: true,
                        roam: true,
                        hoverAnimation: false,
                        // labelLayout: {
                        //     hideOverlap: true,
                        // },
                        legendHoverLink: false,
                        nodeScaleRatio: 0.6, //鼠标漫游缩放时节点的相应缩放比例，当设为0时节点不随着鼠标的缩放而缩放
                        focusNodeAdjacency: false, //是否在鼠标移到节点上的时候突出显示节点以及节点的边和邻接节点。
                        // categories: categories,
                        itemStyle: {
                            color: "#67A3FF",
                        },
                        edgeSymbol: ["", "arrow"],
                        // edgeSymbolSize: [80, 10],
                        edgeLabel: {
                            normal: {
                                show: true,
                                textStyle: {
                                    fontSize: 12,
                                },
                                formatter(x) {
                                    return x.data.name;
                                },
                            },
                        },
                        label: {
                            normal: {
                                show: true,
                                textStyle: {
                                    fontSize: 12,
                                },
                                color: "#f6f6f6",
                                textBorderColor: '#67A3FF',
                                textBorderWidth: '1.3',
                                // 多字换行
                                formatter: function (params) {
                                    // console.log(params);
                                    var newParamsName = "";
                                    var paramsNameNumber = params.name.length;
                                    var provideNumber = 7; //一行显示几个字
                                    var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                                    if (paramsNameNumber > provideNumber) {
                                        for (var p = 0; p < rowNumber; p++) {
                                            var tempStr = "";
                                            var start = p * provideNumber;
                                            var end = start + provideNumber;
                                            if (p == rowNumber - 1) {
                                                tempStr = params.name.substring(start, paramsNameNumber);
                                            } else {
                                                tempStr = params.name.substring(start, end) + "\n\n";
                                            }
                                            newParamsName += tempStr;
                                        }
                                    } else {
                                        newParamsName = params.name;
                                    }
                                    return newParamsName;
                                },
                            },
                        },
                        force: {
                            repulsion: 200, // 节点之间的斥力因子。支持数组表达斥力范围，值越大斥力越大。
                            gravity: 0.01, // 节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
                            edgeLength: 400, // 边的两个节点之间的距离，这个距离也会受 repulsion影响 。值越大则长度越长
                            layoutAnimation: true, // 因为力引导布局会在多次迭代后才会稳定，这个参数决定是否显示布局的迭代动画
                            // 在浏览器端节点数据较多（>100）的时候不建议关闭，布局过程会造成浏览器假死。
                        },
                        data: this.data,
                        links: this.links,
                    }

                ]
            }
            this.mapcharts.setOption(this.options);
        },
    },


};
</script>

<style scoped>
</style>