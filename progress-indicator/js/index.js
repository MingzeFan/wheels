class ProgressIndicator {
  constructor (options) {
    let defaultOptions = {
      color: '#0A74DA'
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.init()
  }
  init () {
    this.createIndicator()
    var width = this.calculateWidthPercent()
    this.setWidth(width)
    this.bindScrollEvent()
  }
  createIndicator () {
    // console.log('创建')
    let div = document.createElement('div')
    div.id = 'progress-indicator'
    div.className = 'progress-indicator'
    div.style.position = 'fixed'
    div.style.top = 0
    div.style.left = 0
    div.style.height = '3px'
    div.style.backgroundColor = this.options.color

    this.element = div
    document.body.appendChild(div)
  }
  calculateWidthPercent () {
    // 文档高度
    var docHeight = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight)
    // 视口高度
    var vHeight = window.innerHeight
    // 差值
    this.offetsHeight = Math.max(docHeight - vHeight, 0)
    // 滚动条垂直偏移量
    var scrollHeight = window.pageYOffset
    return this.offetsHeight ? scrollHeight / this.offetsHeight : 0
  }
  setWidth (perc) {
    this.element.style.width = perc * 100 + "%"
  }
  bindScrollEvent () {
    var self = this
    var prev
    window.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () {
        var perc = Math.min(window.pageYOffset / self.offetsHeight, 1)
        if (perc == prev) return;

        prev = perc;
        self.setWidth(perc)
      })
    })
  }
}