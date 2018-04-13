import './slidery.less'

const initNodes = node => {
  const wrapperNode = node
  let baseNode = wrapperNode.querySelector('.slidery-base')
  let progressNode = wrapperNode.querySelector('.slidery-progress')
  let liftNode = wrapperNode.querySelector('.slidery-lift')

  if (!baseNode) {
    baseNode = document.createElement('div')
    baseNode.classList.add('slidery-base')
    wrapperNode.append(baseNode)
  }
  if (!progressNode) {
    progressNode = document.createElement('div')
    progressNode.classList.add('slidery-progress')
    wrapperNode.append(progressNode)
  }
  if (!liftNode) {
    liftNode = document.createElement('div')
    liftNode.classList.add('slidery-lift')
    wrapperNode.append(liftNode)
  }
  return { wrapperNode, baseNode, progressNode, liftNode }
}

const formatValue = (value, precision = 0, separator = '.') => {
  const formattedValue = value.toFixed(precision)
  if (separator !== '.') {
    return formattedValue.replace('.', separator)
  }
  return formattedValue
}
const debounce = (func, wait = 100) => {
  let timer
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
const funcIdRegExp = /\[[\w-_\.]+\]/gi
const calculateValue = (func, sliders) => {
  let funcWithValues = func.match(funcIdRegExp).reduce((tempFunc, match) => {
    const id = match.replace(/\[?\]?/g, '')
    const slider = sliders[id]
    if (!slider) {
      return tempFunc
    }
    const value = slider.value
    return tempFunc.replace(match, value)
  }, func)
  funcWithValues = funcWithValues.replace(',', '.')
  return eval(funcWithValues)
}

class Slidery {
  constructor(options = {}) {
    this.options = Object.assign(
      {},
      {
        className: 'slidery',
        targetClassName: 'slidery-target'
      },
      options
    )
    this.sliders = {}
    this.activeSliders = {}
    this.listeners = {}
    const allTargets = [].slice
      .call(document.querySelectorAll(`.${this.options.targetClassName}`))
      .map(node => {
        return {
          node,
          value: node.dataset.value,
          precision: node.dataset.precision || 0,
          separator: node.dataset.separator || ''
        }
      })
    const slidersArray = [].slice.call(
      document.querySelectorAll(`.${this.options.className}`)
    )
    slidersArray.forEach(node => {
      const id = node.id || (Math.random() * 4000).toString()
      const width = node.getBoundingClientRect().width
      const targets = allTargets.filter(
        ({ value }) =>
          (value && value.indexOf(id) !== -1) || (!value && !node.id)
      )
      const range =
        node.dataset.range && /-?\d+\.\.\.-?\d+/.test(node.dataset.range)
          ? node.dataset.range.split('...').map(i => parseInt(i, 10))
          : [0, width]
      const scale = width / (range[1] - range[0])

      let initialValue, initialProgress
      if (
        node.dataset.initialValue &&
        parseInt(node.dataset.initialValue, 10)
      ) {
        initialValue = parseInt(node.dataset.initialValue, 10)
        if (initialValue < range[0]) initialValue = range[0]
        if (initialValue > range[1]) initialValue = range[1]
        initialProgress = (initialValue - range[0]) * scale
      } else {
        initialProgress = width / 2
        initialValue = range[0] + initialProgress / scale
      }

      const listeners = {
        baseClick: this.handleBaseNodeClick(id),
        liftMouseDown: this.handleLiftNodeMouseDown(id),
        touchStart: this.handleLiftNodeTouchStart(id)
      }
      this.listeners[id] = listeners

      const nodes = initNodes(node)
      nodes.baseNode.addEventListener('click', listeners.baseClick)
      nodes.liftNode.addEventListener('mousedown', listeners.liftMouseDown)
      nodes.liftNode.addEventListener('touchstart', listeners.touchStart)

      const liftPosition = initialProgress / width * 100
      nodes.liftNode.style.left = `${liftPosition}%`
      nodes.progressNode.style.width = `${liftPosition}%`

      this.sliders[id] = {
        id,
        nodes,
        targets,
        width,
        range,
        scale,
        value: initialValue,
        progress: initialProgress
      }
    })

    Object.values(this.sliders).forEach(slider => {
      this.adjustTargets(slider.targets, slider.value)
    })
    window.addEventListener('resize', debounce(this.handleWindowResize, 300))
  }

  // Window handlers
  handleWindowResize = () => {
    Object.values(this.sliders).forEach(slider => {
      const newWidth = slider.nodes.baseNode.getBoundingClientRect().width
      slider.progress = slider.progress / slider.width * newWidth
      slider.width = newWidth
      slider.scale = newWidth / (slider.range[1] - slider.range[0])
    })
  }

  // Handers
  handleBaseNodeClick = id => event => {
    const progress = event.offsetX
    this.adjustSlider(id, progress, true)
  }
  handleLiftNodeMouseDown = id => event => {
    const slider = this.sliders[id]
    if (!slider) return
    this.activeSliders[id] = {
      initialScreenPosition: event.screenX,
      initialProgress: slider.progress
    }
    const handleMove = this.handleMouseMove(id)
    const handleUp = this.handleMouseUp(id)
    this.listeners[id].mouseMove = handleMove
    this.listeners[id].mouseUp = handleUp
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)

    document.body.classList.add('slidery-no-select-text')
    slider.nodes.liftNode.classList.add('slidery-is-sliding')
    slider.targets.forEach(target => {
      target.node.classList.add('slidery-is-sliding')
    })
  }
  handleLiftNodeTouchStart = id => event => {
    const slider = this.sliders[id]
    if (!slider) return
    const touch = event.targetTouches.length && event.targetTouches.item(0)
    if (!touch) return
    this.activeSliders[id] = {
      initialScreenPosition: touch.screenX,
      touchId: touch.identifier,
      initialProgress: slider.progress
    }
    const handleTouchMove = this.handleTouchMove(id)
    const handleTouchEnd = this.handleTouchEnd(id)
    this.listeners[id].mouseMove = handleTouchMove
    this.listeners[id].mouseUp = handleTouchEnd
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    document.body.classList.add('slidery-no-select-text')
    slider.nodes.liftNode.classList.add('slidery-is-sliding')
    slider.targets.forEach(target => {
      target.node.classList.add('slidery-is-sliding')
    })
  }
  handleMouseUp = id => event => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialProgress, initialScreenPosition } = activeSlider
    const progress = initialProgress + event.screenX - initialScreenPosition
    this.adjustSlider(id, progress, true)

    this.activeSliders[id] = null
    if (this.listeners[id]) {
      document.removeEventListener('mousemove', this.listeners[id].mouseMove)
      document.addEventListener('mouseup', this.listeners[id].mouseUp)
    }
    document.body.classList.remove('slidery-no-select-text')
    const slider = this.sliders[id]
    if (slider) {
      slider.nodes.liftNode.classList.remove('slidery-is-sliding')
      slider.targets.forEach(target => {
        target.node.classList.remove('slidery-is-sliding')
      })
    }
  }
  handleTouchEnd = id => event => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialProgress, initialScreenPosition, touchId } = activeSlider
    const touch = [].slice
      .call(event.changedTouches)
      .find(t => t.identifier === touchId)
    if (!touch) return

    const progress = initialProgress + touch.screenX - initialScreenPosition
    this.adjustSlider(id, progress, true)

    this.activeSliders[id] = null
    if (this.listeners[id]) {
      document.removeEventListener('mousemove', this.listeners[id].mouseMove)
      document.addEventListener('mouseup', this.listeners[id].mouseUp)
    }
    document.body.classList.remove('slidery-no-select-text')
    const slider = this.sliders[id]
    if (slider) {
      slider.nodes.liftNode.classList.remove('slidery-is-sliding')
      slider.tempValue = null
      slider.targets.forEach(target => {
        target.node.classList.remove('slidery-is-sliding')
      })
    }
  }
  handleMouseMove = id => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialProgress, initialScreenPosition } = activeSlider
    return event => {
      const progress = initialProgress + event.screenX - initialScreenPosition
      this.adjustSlider(id, progress)
    }
  }
  handleTouchMove = id => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialProgress, initialScreenPosition, touchId } = activeSlider
    return event => {
      const touch = [].slice
        .call(event.changedTouches)
        .find(t => t.identifier === touchId)
      if (!touch) return

      const progress = initialProgress + touch.screenX - initialScreenPosition
      this.adjustSlider(id, progress)
    }
  }

  // Helpers
  adjustTargets = (targets, newValue) => {
    targets.forEach(target => {
      if (target.node) {
        if (target.value) {
          target.node.innerHTML = formatValue(
            calculateValue(target.value, this.sliders),
            target.precision,
            target.separator
          )
        } else {
          target.node.innerHTML = formatValue(
            newValue,
            target.precision,
            target.separator
          )
        }
      }
    })
  }
  adjustSlider = (id, progress, setNewProgress = false) => {
    const slider = this.sliders[id]
    if (!slider) return

    let newProgress = progress
    if (newProgress < 0) newProgress = 0
    if (newProgress > slider.width) newProgress = slider.width

    const newValue = slider.range[0] + newProgress / slider.scale
    const newPosition = newProgress / slider.width * 100

    slider.nodes.liftNode.style.left = `${newPosition}%`
    slider.nodes.progressNode.style.width = `${newPosition}%`
    slider.value = newValue

    if (setNewProgress) {
      slider.progress = newProgress
    }
    this.adjustTargets(slider.targets, newValue)
  }
}

;(function() {
  new Slidery()
})()
