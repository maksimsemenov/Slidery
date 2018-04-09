import accounting from 'accounting'
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

const calculateValue = (x, func) => {
  if (!func) {
    return x
  }
  if (typeof func === 'string') {
    return eval(func)
  }
  if (typeof func === 'function') {
    return func(x)
  }
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
          source: node.dataset.source,
          func: node.dataset.func,
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
        ({ source }) => (source && source === id) || (!source && !node.id)
      )
      const range =
        node.dataset.range && /\d+\.\.\.\d+/.test(node.dataset.range)
          ? node.dataset.range.split('...')
          : [0, width]
      const scale = width / (range[1] - range[0])
      let initialValue = parseInt(node.dataset.value, 10) || width / 2
      if (initialValue < range[0]) initialValue = range[0]
      if (initialValue > range[1]) initialValue = range[1]

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

      const liftPosition = scale * initialValue
      nodes.liftNode.style.left = `${liftPosition}px`
      nodes.progressNode.style.width = `${liftPosition}px`
      targets.forEach(
        target =>
          (target.node.innerHTML = accounting.formatNumber(
            calculateValue(initialValue, target.func),
            target.precision,
            target.separator
          ))
      )

      this.sliders[id] = {
        nodes,
        targets,
        width,
        initialValue,
        range,
        scale,
        value: initialValue * scale
      }
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
      initialValue: slider.value
    }
    const handleMove = this.handleMouseMove(id)
    const handleUp = this.handleMouseUp(id)
    this.listeners[id].mouseMove = handleMove
    this.listeners[id].mouseUp = handleUp
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)

    document.body.classList.add('slidery-no-select-text')
    slider.nodes.liftNode.classList.add('slidery-is-sliding')
  }
  handleLiftNodeTouchStart = id => event => {
    const slider = this.sliders[id]
    if (!slider) return
    const touch = event.targetTouches.length && event.targetTouches.item(0)
    if (!touch) return
    this.activeSliders[id] = {
      initialScreenPosition: touch.screenX,
      touchId: touch.identifier,
      initialValue: slider.value
    }
    const handleTouchMove = this.handleTouchMove(id)
    const handleTouchEnd = this.handleTouchEnd(id)
    this.listeners[id].mouseMove = handleTouchMove
    this.listeners[id].mouseUp = handleTouchEnd
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    document.body.classList.add('slidery-no-select-text')
    slider.nodes.liftNode.classList.add('slidery-is-sliding')
  }
  handleMouseUp = id => event => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialValue, initialScreenPosition } = activeSlider
    const progress = initialValue + event.screenX - initialScreenPosition
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
    }
  }
  handleTouchEnd = id => event => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialValue, initialScreenPosition, touchId } = activeSlider
    const touch = [].slice
      .call(event.changedTouches)
      .find(t => t.identifier === touchId)
    if (!touch) return

    const progress = initialValue + touch.screenX - initialScreenPosition
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
    }
  }
  handleMouseMove = id => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialValue, initialScreenPosition } = activeSlider
    return event => {
      const progress = initialValue + event.screenX - initialScreenPosition
      this.adjustSlider(id, progress)
    }
  }
  handleTouchMove = id => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialValue, initialScreenPosition, touchId } = activeSlider
    return event => {
      const touch = [].slice
        .call(event.changedTouches)
        .find(t => t.identifier === touchId)
      if (!touch) return

      const progress = initialValue + touch.screenX - initialScreenPosition
      this.adjustSlider(id, progress)
    }
  }
  adjustSlider = (id, value, setNewValue = false) => {
    const slider = this.sliders[id]
    if (!slider) return

    let newValue = value
    if (newValue < 1) newValue = 1
    if (newValue > slider.width) newValue = slider.width

    slider.nodes.liftNode.style.left = `${newValue}px`
    slider.nodes.progressNode.style.width = `${newValue}px`

    if (setNewValue) {
      slider.value = newValue
    }
    slider.targets.forEach(
      target =>
        (target.node.innerHTML = accounting.formatNumber(
          calculateValue(newValue / slider.scale, target.func),
          target.precision,
          target.separator
        ))
    )
  }
}

;(function() {
  new Slidery()
})()
