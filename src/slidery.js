import './slidery.less'

export const initNodes = node => {
  const wrapperNode = node
  let baseNode = wrapperNode.querySelector('.slidery-base')
  let progressNode = wrapperNode.querySelector('.slidery-progress')
  let liftNode = wrapperNode.querySelector('.slidery-lift')

  if (!wrapperNode.classList.contains('slidery')) {
    wrapperNode.classList.add('slidery')
  }

  if (!baseNode) {
    baseNode = document.createElement('div')
    baseNode.classList.add('slidery-base')
  }
  const baseTargetNode = document.createElement('div')
  baseTargetNode.classList.add('slidery-base__target')
  baseNode.append(baseTargetNode)

  if (!progressNode) {
    progressNode = document.createElement('div')
    progressNode.classList.add('slidery-progress')
  }
  if (!liftNode) {
    liftNode = document.createElement('div')
    liftNode.classList.add('slidery-lift')
  }

  wrapperNode.append(baseNode)
  wrapperNode.append(progressNode)
  wrapperNode.append(liftNode)
  return { wrapperNode, baseNode, progressNode, liftNode }
}

export const formatValue = (value, precision = 0, separator = '.') => {
  if (value === undefined || value === null) return ''
  const formattedValue = value.toFixed(precision)
  if (separator !== '.') {
    return formattedValue.replace('.', separator)
  }
  return formattedValue
}
export const debounce = (func, wait = 100) => {
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

export const getClosestStep = (value, range, stepsCount) => {
  if (!value) return 0
  if (!(stepsCount && range)) return value
  const step = range / stepsCount
  return Math.round(value / step) * step
}

export const evalFuncWithValues = (func, values) => {
  const funcWithValues = Object.keys(values).reduce((tempFunc, id) => {
    return tempFunc.replace(new RegExp(`\\[${id}\\]`, 'g'), values[id])
  }, func)

  try {
    return eval(funcWithValues)
  } catch (e) {
    return undefined
  }
}

export const getSlidersFromHtml = (className = 'slidery') =>
  [].slice.call(document.querySelectorAll(`.${className}`)).map(node => {
    const range =
      node.dataset.range && /-?\d+\.\.\.-?\d+/.test(node.dataset.range)
        ? node.dataset.range.split('...').map(i => parseInt(i, 10))
        : undefined

    const value =
      node.dataset.initialValue && parseInt(node.dataset.initialValue, 10)

    return {
      element: node,
      range,
      value,
      id: node.id,
      steps: node.dataset.steps ? parseInt(node.dataset.steps, 10) : undefined
    }
  })

export const getTargetsFromHtml = (className = 'slidery-target') =>
  [].slice.call(document.querySelectorAll(`.${className}`)).map(node => {
    const precision = node.dataset.precision || 0
    const separator = node.dataset.separator || ''

    const source = node.dataset.value
      ? node.dataset.value
          .match(funcIdRegExp)
          .map(match => match.replace(/\[?\]?/g, ''))
          .reduce((sourceSet, id) => {
            if (sourceSet.indexOf(id) === -1) {
              return [...sourceSet, id]
            }
            return sourceSet
          }, [])
      : undefined

    const onChange =
      source && source.length > 1
        ? values => {
            node.innerHTML = formatValue(
              evalFuncWithValues(node.dataset.value, values),
              precision,
              separator
            )
          }
        : value => (node.innerHTML = formatValue(value, precision, separator))
    return {
      node,
      source,
      onSlidingStart: () => node.classList.add('slidery-is-sliding'),
      onSlidingEnd: () => node.classList.remove('slidery-is-sliding'),
      onChange
    }
  })

export const initFromHtml = (sliderClass, targetClass) => {
  const slidersArray = getSlidersFromHtml(sliderClass)
  const targetsArray = getTargetsFromHtml(targetClass)
  if (slidersArray.length && targetsArray.length) {
    return new Slidery(slidersArray, targetsArray)
  }
}

/*
*  Slidery class
*/

export default class Slidery {
  constructor(sliders, targets) {
    if (
      !(
        (Array.isArray(sliders) && sliders.length > 0) ||
        typeof sliders === 'object'
      )
    ) {
      return undefined
    }
    this.sliders = {}
    this.activeSliders = {}
    this.listeners = {}

    const slidersArray = Array.isArray(sliders) ? sliders : [sliders]
    const targetsArray =
      Array.isArray(targets) && targets.length
        ? targets
        : typeof targets === 'object' ? [targets] : []
    slidersArray
      .filter(
        slider => slider && (slidersArray.length === 1 ? true : !!slider.id)
      )
      .forEach(
        ({
          id = (Math.random() * 4000).toString(),
          element,
          range: initialRange,
          value,
          steps
        }) => {
          if (!element) return
          const targets = targetsArray
            .map(target => {
              let source = target.source
              if (typeof source === 'string') source = [source]
              if (Number.isInteger(source)) source = [source.toString()]
              if (
                !(
                  Array.isArray(source) ||
                  source === undefined ||
                  source === null
                )
              )
                source = slidersArray.length === 1 ? [id] : undefined

              return Object.assign({}, target, { source })
            })
            .filter(({ source }) => source && source.indexOf(id) !== -1)

          const width = element.getBoundingClientRect().width
          const range =
            Array.isArray(initialRange) && initialRange.length === 2
              ? initialRange
              : [0, width]
          const scale = width / (range[1] - range[0])

          let initialValue, initialProgress
          if (value) {
            initialValue = value
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

          const nodes = initNodes(element)
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
            stepsCount: steps ? steps : undefined,
            value: initialValue,
            progress: initialProgress
          }
        }
      )

    Object.values(this.sliders).forEach(slider => {
      this.adjustTargets(slider.targets, this.sliders)
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
    let progress = event.offsetX
    if (progress === undefined || progress === null) {
      const left = event.target.getBoundingClientRect().left
      progress = event.clientX - left
    }
    this.adjustSlider(id, progress, true)
  }
  handleLiftNodeMouseDown = id => event => {
    const slider = this.sliders[id]
    if (!slider) return
    this.activeSliders[id] = {
      initialScreenPosition: event.screenX,
      initialProgress: slider.progress
    }
    this.initSliderBeforeSliding(id, 'mouse')
  }
  handleLiftNodeTouchStart = id => event => {
    const slider = this.sliders[id]
    if (!slider) return
    const touches = [].slice.call(event.targetTouches)
    const touch = touches.length && touches[0]
    if (!touch) return
    this.activeSliders[id] = {
      initialScreenPosition: touch.screenX,
      touchId: touch.identifier,
      initialProgress: slider.progress
    }
    this.initSliderBeforeSliding(id, 'touch')
  }
  handleMouseUp = id => event => {
    const activeSlider = this.activeSliders[id]
    if (!activeSlider) return

    const { initialProgress, initialScreenPosition } = activeSlider
    const progress = initialProgress + event.screenX - initialScreenPosition
    this.adjustSlider(id, progress, true)
    this.cleanupSliderAfterSliding(id, 'mouse')
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
    this.cleanupSliderAfterSliding(id, 'touch')
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
  initSliderBeforeSliding = (id, handlerType) => {
    const moveHandlerName = handlerType === 'mouse' ? 'MouseMove' : 'TouchMove'
    const stopHandlerName = handlerType === 'mouse' ? 'MouseUp' : 'TouchEnd'

    const handleMove = this[`handle${moveHandlerName}`](id)
    const handleStop = this[`handle${stopHandlerName}`](id)
    this.listeners[id][moveHandlerName.toLowerCase()] = handleMove
    this.listeners[id][stopHandlerName.toLowerCase()] = handleStop
    document.addEventListener(moveHandlerName.toLowerCase(), handleMove)
    document.addEventListener(stopHandlerName.toLowerCase(), handleStop)

    document.body.classList.add('slidery-no-select-text')
    const slider = this.sliders[id]
    if (slider) {
      slider.nodes.liftNode.classList.add('slidery-is-sliding')
      slider.targets.forEach(
        target => target.onSlidingStart && target.onSlidingStart()
      )
    }
  }
  cleanupSliderAfterSliding = (id, handlerType) => {
    this.activeSliders[id] = null
    const listeners = this.listeners[id]
    if (listeners) {
      const moveHandlerName = `${handlerType}move`
      const stopHandlerName = handlerType === 'mouse' ? 'mouseup' : 'touchend'
      listeners[moveHandlerName] &&
        document.removeEventListener(
          moveHandlerName,
          listeners[moveHandlerName]
        )
      listeners[stopHandlerName] &&
        document.removeEventListener(
          stopHandlerName,
          listeners[stopHandlerName]
        )
      this.listeners[id] = {}
    }
    document.body.classList.remove('slidery-no-select-text')
    const slider = this.sliders[id]
    if (slider) {
      slider.nodes.liftNode.classList.remove('slidery-is-sliding')
      slider.targets.forEach(
        target => target.onSlidingEnd && target.onSlidingEnd()
      )
    }
  }
  adjustTargets = (targets, sliders) => {
    targets.forEach(({ onChange, source }) => {
      if (!(onChange && Array.isArray(source))) return
      onChange(
        source.length === 1
          ? sliders[source[0]].value
          : source.filter(id => !!sliders[id]).reduce((values, id) => {
              values[id] = sliders[id].value
              return values
            }, {})
      )
    })
  }
  adjustSlider = (id, progress, setNewProgress = false) => {
    const slider = this.sliders[id]
    if (!slider) return

    let newProgress = progress
    if (slider && slider.stepsCount)
      newProgress = getClosestStep(progress, slider.width, slider.stepsCount)
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
    this.adjustTargets(slider.targets, this.sliders)
  }
}
