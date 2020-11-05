(function () {
  //状态
  let _state = 'pending'
  //touchstart的Y轴位置
  let pullStartY = null
  //touchmove时Y轴的位置
  let pullMoveY = null
  //手指移动的距离
  let dist = 0
  // refresh-element 要移动的距离，跟手指距离的值不同，因为要有阻尼效果
  let distResisted = 0
  let supportsPassive = false
  class PullToRefresh {
    constructor (options) {
      let defaultOptions = {
        pullText: '下拉以刷新页面',
        relaseText: '释放以刷新页面',
        // 当大于 60px 的时候才会触发 relase 事件
        threshold: 60,
        // 最大可以拉到 80px 的高度
        max: 80,
        // 下拉时的图标
        pullIcon: "&#8675;",
        // 释放后的图标
        refreshIcon: "&hellip;",
        // 释放后的文字
        refreshText: '刷新',
        // 释放后，高度回到 50px
        reloadHeight: 50
      }
      this.options = Object.assign({}, defaultOptions, options)
      this.init()
    }
    init () {
      this.createRefreshElement()
      this.setRefreshStyle()
      this.getElement()
      this.supportsPassive()
      this.bindEvent()
    }
    createRefreshElement () {
      let elem = document.createElement('div')
      if (this.options.target !== 'body') {
        const target = document.getElementById(this.options.target)
        target.parentNode.insertBefore(elem, target)
      } else {
        document.body.insertBefore(elem, document.body.firstChild)
      }
  
      elem.id = 'refresh-element'
      elem.className = 'refresh-element'
      
      elem.innerHTML = '<div class="refresh-box"><div class="refresh-content"><div class="refresh-icon"></div><div class="refresh-text"></div></div></div>'
    }
    setRefreshStyle () {
      let styleElem = document.createElement('style')
      styleElem.setAttribute('id', 'refresh-element-style')
      document.head.appendChild(styleElem)
      styleElem.textContent = '.refresh-element {pointer-event: none; width: 100%; height: 0; top: 0; font-size: 0.85em; transition: height 0.3s, min-height 0.3s; text-align: center; overflow: hidden; color: #fff;} .refresh-box {padding: 10px;} .pull {transition: none;} .refresh-icon {transition: transform .3s} .refresh-text {margin-top: .33em} .release .refresh-icon {transform: rotate(180deg);}'
    }
    getElement () {
      this.refreshElm = document.getElementById('refresh-element')
    }
    supportsPassive () {
      try {
        var opts = Object.defineProperty({}, 'passive', {
          get: function() {
              supportsPassive = true
          }
        })
        window.addEventListener("test", null, opts)
      } catch (e) {}
    }
    //没有滚动条或者滚动条在顶部的时候才能下拉刷新
    shouldPullToRefresh () {
      return !window.scrollY
    }
    bindEvent () {
      window.addEventListener('touchstart', this)
      window.addEventListener('touchmove', this, supportsPassive ? { passive: false } : false)
      window.addEventListener('touchend', this)
    }
    handleEvent (event) {
      const method = `on${event.type}`
      if (this[method]) {
        this[method](event)
      }
    }
    resistanceFunction (t) {
      return Math.min(1, t / 2.5)
    }
    ontouchstart (e) {
      if (this.shouldPullToRefresh()) {
        pullStartY = e.touches[0].screenY
      }
      if (_state !== 'pending') {
        return
      }
      _state = 'pending'
      this.update()
    }
    //根据状态更新文字
    update () {
      let textEl = this.refreshElm.querySelector('.refresh-text')
      let iconEL = this.refreshElm.querySelector('.refresh-icon')
      if (_state === 'refreshing') {
        iconEL.innerHTML = this.options.refreshIcon;
      } else {
        iconEL.innerHTML = this.options.pullIcon;
      }
      if (_state === 'releasing') {
        textEl.innerHTML = this.options.relaseText;
      }
      if (_state === 'pulling' || _state === 'pending') {
        textEl.innerHTML = this.options.pullText
      }
      if (_state === 'refreshing') {
        textEl.innerHTML = this.options.refreshText;
      }
    }
    ontouchmove (e) {
      pullMoveY = e.touches[0].screenY
      if (_state === 'refreshing') {
        return
      }
      if (_state === 'pending') {
        this.refreshElm.classList.add(('pull'))
        _state = 'pulling'
        this.update()
      }
      //计算手指移动距离
      if (pullStartY && pullMoveY) {
        dist = pullMoveY - pullStartY
      }
      if (dist > 0) {
        //阻止默认事件，否则下拉的时候既刷新，滚动条又滚动
        e.preventDefault()
        this.refreshElm.style.minHeight = distResisted + 'px'
        distResisted = this.resistanceFunction(dist / this.options.threshold) *
        Math.min(this.options.max, dist)
      }
      if (_state === 'pulling' && distResisted > this.options.threshold) {
        this.refreshElm.classList.add('release')
        _state = 'releasing'
        this.update()
      }
      if (_state === 'releasing' && distResisted < this.options.threshold) {
        this.refreshElm.classList.remove('release')
        _state = 'pulling'
        this.update()
      }
    }
    ontouchend () {
      if (_state === 'releasing' && distResisted > this.options.threshold) {
        _state = 'refreshing'
        this.refreshElm.style['minHeight'] = this.options.reloadHeight + 'px'
        this.refreshElm.classList.add('refresh')
        if (typeof this.options.onRefresh === 'function') {
          //onReset作为回调函数传入，确保onRefresh执行完再执行
          this.options.onRefresh(this.onReset.bind(this))
        }
      } else {
        if (_state === 'refreshing') {
          return
        }
        this.refreshElm.style['minHeight'] = '0px'
        _state = 'pending'
      }
      this.update()
      this.refreshElm.classList.remove('release')
      this.refreshElm.classList.remove('pull')
      pullStartY = pullMoveY = null
      dist = distResisted = 0
    }
    onReset () {
      this.refreshElm.style['min-height'] = '0px'
      this.refreshElm.classList.remove('refresh')
      _state = 'pending'
    }
  }
  window.PullToRefresh = PullToRefresh
}) ()