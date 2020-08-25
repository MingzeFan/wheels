;
(function () {
  function Drag (selector) {
    this.elem = typeof selector === 'object' ? selector : document.getElementById(selector)
    //目标的坐标
    this.targetX = 0
    this.targetY = 0
    //鼠标的坐标
    this.startX = 0
    this.startY = 0
  
    this.init()
  }
  //获取transform的兼容写法
  function getTransform () {
    var transform = ''
    var divStyle = document.createElement('div').style
    var transformList = ['transform', 'webkitTransform', 'mozTransform', 'OTransform', 'msTransform']
    for (let i = 0; i < transformList.length; i++) {
      if (transformList[i] in divStyle) {
        return transform = transformList[i]
      }
    }
    return transform
  }
  var transform = getTransform()
  
  Drag.prototype = {
    constructor: Drag,
    init: function () {
      this.setDrag()
    },
    setDrag: function () {
      var self = this
      self.elem.addEventListener('mousedown', start, false)
      function start (event) {
        self.startX = event.pageX
        self.startY = event.pageY
        var pos = self.getTargetPos()
        self.targetX = pos.x
        self.targetY = pos.y
        document.addEventListener('mousemove', move, false)
        document.addEventListener('mouseup', end, false)
      }
      function move (event) {
        var distanceX = event.pageX - self.startX
        var distanceY = event.pageY - self.startY
        var pos = {
          x: self.targetX + distanceX,
          y: self.targetY + distanceY
        }
        self.setTargetPos(pos)
      }
      function end () {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', end)
      }
    },
    // 获取css属性值
    getStyle: function (property) {
      return document.defaultView.getComputedStyle ?
      document.defaultView.getComputedStyle(this.elem, false)[property] :
      //兼容IE
      this.elem.currentStyle[property]
    },
    // 获取目标的初始位置
    getTargetPos: function () {
      var pos = { x: 0, y: 0}
      if (transform) {
        var transformValue = this.getStyle(transform)
        if (transformValue === 'none') {
          this.elem.style['position'] = 'translate(0, 0)'
        } else {
          var temp = transformValue.match(/-?\d+/g)
          pos = {
            x: parseInt(temp[4].trim()),
            y: parseInt(temp[5].trim())
          }
        }
      } else {
        if (this.getStyle('position') === 'static') {
          this.elem.style['position'] = 'relative'
        } else {
          pos = {
            x: this.getStyle('left') ? this.getStyle('left') : 0,
            y: this.getStyle('top') ? this.getStyle('top') : 0,
          }
        }
      }
      return pos
    },
    //拖动过程中设置目标位置
    setTargetPos: function (pos) {
      if (transform) {
        this.elem.style[transform] = `translate(${pos.x}px, ${pos.y}px)`
      } else {
        this.elem.style.left = `${pos.x}px`
        this.elem.style.top = `${pos.y}px`
      }
    }
  }
  
  window.Drag = Drag
})()
