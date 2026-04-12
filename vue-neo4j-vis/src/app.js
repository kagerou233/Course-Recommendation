import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'
Vue.use(ElementUI);

//引入echart,在5.0以后的版本，echarts做了比较大的调整
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts'
// import * as echarts from 'echarts/lib/echarts';
Vue.prototype.$echarts = echarts

import router from './router'

import {
	sync
} from 'vuex-router-sync'
window.jQuery = window.$ = require('jquery/dist/jquery')
const app = new Vue({
	router,
	...App
})


export {
	app,
	router
}