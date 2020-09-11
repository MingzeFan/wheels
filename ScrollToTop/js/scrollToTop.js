;
(function () {
  function ScrolltoTop (element, options) {
    this.element = typeof element === 'string' ? 
    document.getElementById(element) :
    element
    this.options = Object.assign({}, this.constructor.defaultOptions, options)
    this.init()
  }
  ScrolltoTop.defaultOptions = {
    showWhen: 100,
    speed: 100,
    fadeSpeed: 10
  }
  var utils = {
    getScrollOffets: function () {
      if (window.pageXOffset != undefined) {
        return {
          x: window.pageXOffset,
          y: window.pageYOffset
        }
      } else {
        return {
          x: document.documentElement.scrollLeft,
          y: document.documentElement.scrollTop
        }
      }
    },
    setOpacity: function (element, opacity) {
      element.style.opacity = opacity / 100
    },
    fedeIn: function (element, speed) {
      this.setOpacity(element, 0)
      var opacity = 0
      var timer
      function setp () {
        utils.setOpacity(element, opacity += speed)
        if (opacity < 100) {
          timer = requestAnimationFrame(setp)
        } else {
          cancelAnimationFrame(setp)
        }
      }
      requestAnimationFrame(setp)
    },
    fadeOut: function (element, speed) {
      this.setOpacity(element, 100)
      var opacity = 100
      var timer
      function setp () {
        utils.setOpacity(element, opacity -= speed)
        if (opacity > 0) {
          timer = requestAnimationFrame(setp)
        } else {
          cancelAnimationFrame(setp)
        }
      }
      requestAnimationFrame(setp)
    },
    addClass: function (element, className) {
      var classNames = element.className.split(' ')
      var index = classNames.findIndex(cla => cla === className)
      if (index === -1) {
        classNames.push(className)
      }
      element.className = classNames.join(' ')
    },
    removeClass: function (element, className) {
      var classNames = element.className.split(' ')
      var index = classNames.findIndex(cla => cla === className)
      if (index !== -1) {
        classNames.splice(index, 1)
      }
      element.className = classNames.join(' ')
    }
  }
  var proto = ScrolltoTop.prototype
  proto.init = function () {
    this.hideElement()
    this.bindScrollEvent()
    this.bindToTopEvent()
  }
  proto.hideElement = function () {
    console.log('hide')
    utils.setOpacity(this.element, 0)
    this.status = 'hide'
  }
  proto.bindScrollEvent = function () {
    var self = this
    window.addEventListener('scroll', function () {
      if (utils.getScrollOffets().y > self.options.showWhen) {
        // console.log(utils.getScrollOffets().y)
        if (self.status === 'hide') {
          utils.fedeIn(self.element, self.options.fadeSpeed)
          self.status = 'show'
        }
      } else {
        if (self.status === 'show') {
          utils.fadeOut(self.element, self.options.fadeSpeed)
          self.status = 'hide'
          utils.removeClass(self.element, 'backing')
        }
      }
    }, false)
  }
  proto.bindToTopEvent = function () {
    var self = this
    self.element.addEventListener('click', function () {
      utils.addClass(self.element, 'backing')
      var timer
      timer = requestAnimationFrame(function fn() {
        var oTop = document.body.scrollTop || document.documentElement.scrollTop
        if (oTop > 0) {
          document.body.scrollTop = document.documentElement.scrollTop = oTop - self.options.speed
          requestAnimationFrame(fn)
        } else {
          cancelAnimationFrame(timer)
        }
      })
    }, false)
  }

  window.ScrolltoTop = ScrolltoTop
})()
