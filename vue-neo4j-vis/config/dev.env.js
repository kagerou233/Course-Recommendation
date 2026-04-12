var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // 开发环境直连后端，避免 /api 未走代理时拿到 index.html 导致 JSON 解析失败
  API_BASE: '"http://localhost:3000"'
})
