;
(function () {
  function EventEmitter () {
    this._events = {}
  }
  
  var proto = EventEmitter.prototype
  
  function isValidListener (listener) {
    if (typeof listener === 'function') {
      return true
    } else if (listener && typeof listener === 'object') {
      return isValidListener(listener.listener)
    } else {
      return false
    }
  }
  function findIndex (listeners, item) {
    item = typeof item === 'object' ? item.listener : item
    // console.log(item)
    return listeners.findIndex(listener => 
      listener && listener.listener === item
    )
  }
  
  //添加事件
  proto.on = function (eventName, listener) {
    if (!eventName || !listener) {
      return
    }
    if (!isValidListener(listener)) {
      throw new Error('listener must be a function')
    }
    var events = this._events
    var listeners = events[eventName] = events[eventName] || []
    var isListenerWrapped = typeof listener === 'object'
    var index = findIndex(listeners, listener)
    if (index === -1) {
      listeners.push(isListenerWrapped ? listener : {
        listener: listener,
        once: false
      })
      // console.log(listeners)
    }
    return this
  }
  //添加事件，该事件只执行一次
  proto.once = function (eventName, listener) {
    return this.on(eventName, {
      listener: listener,
      once: true
    })
  }
  //删除事件
  proto.off = function (eventName, listener) {
    var listeners = this._events[eventName]
    if (!listeners) {
      return
    }
    var index = findIndex(listeners, listener)
    if (index !== -1) {
      listeners.splice(index, 1, null)
    }
    return this
  }
  //触发事件
  proto.emit = function(eventName, args) {
    var listeners = this._events[eventName]
    if (!listeners) {
      return
    }
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i]
      if (listener) {
        listener.listener.apply(this, args || [])
        if (listener.once) {
          this.off(eventName, listener.listener)
        }
      }
    }
    return this
  }
  //删除一个类型的所有事件或者所有事件
  proto.allOff = function (eventName) {
    if (eventName) {
      this._events[eventName] = []
    } else {
      this._events = {}
    }
  }

  window.EventEmitter = EventEmitter
})()
