###!
Copyright (c) 2002-2017 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

'use strict'

neo.utils.clickHandler = ->
  cc = (selection) ->

    # euclidean distance
    dist = (a, b) ->
      Math.sqrt Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2)
    down = undefined
    tolerance = 5
    last = undefined
    wait = null
    selection.on "mousedown", ->
      d3.event.target.__data__.fixed = yes
      down = d3.mouse(document.body)
      last = +new Date()
      d3.event.stopPropagation()

    selection.on "mouseup", ->
      console.log('mouseup 事件触发');
      console.log('鼠标移动距离:', dist(down, d3.mouse(document.body)));
      console.log('容差值:', tolerance);
      console.log('Shift键是否按下:', d3.event.shiftKey);
      
      if dist(down, d3.mouse(document.body)) > tolerance
        console.log('鼠标移动超过容差，忽略点击');
        return
      else
        # 如果按住 Shift 键，直接触发双击（展开节点）
        if d3.event.shiftKey
          console.log('检测到 Shift+点击，触发展开');
          event.dblclick d3.event.target.__data__
          return
          
        if wait
          console.log('检测到双击');
          window.clearTimeout wait
          wait = null
          event.dblclick d3.event.target.__data__
        else
          console.log('第一次点击，等待可能的双击');
          event.click d3.event.target.__data__
          wait = window.setTimeout(((e) ->
            ->
              console.log('双击超时，只是单击');
              wait = null
          )(d3.event), 250)

  event = d3.dispatch("click", "dblclick")
  d3.rebind cc, event, "on"
  