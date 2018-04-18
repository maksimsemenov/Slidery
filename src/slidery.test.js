import simulant from 'simulant'
import Slidery, {
  initNodes,
  formatValue,
  debounce,
  getClosestStep,
  evalFuncWithValues,
  getSlidersFromHtml,
  getTargetsFromHtml,
  initFromHtml
} from './slidery'

jest.useFakeTimers()

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('initNodes', () => {
  it('inits correct nodes if original mode is empty', () => {
    document.body.innerHTML = `
      <div class="slidery" id="first"></div>
    `
    const node = document.getElementById('first')
    expect(initNodes(node)).toMatchSnapshot()
    expect(node).toMatchSnapshot()
  })
  it('it does not create duplicate nodes if original mode is not empty', () => {
    document.body.innerHTML = `
      <div class="slidery" id="first">
        <div class='slidery-base'></div>
      </div>
    `
    const node = document.getElementById('first')
    expect(initNodes(node)).toMatchSnapshot()
    expect(node).toMatchSnapshot()
  })
})
describe('formatValue', () => {
  it('returns correct value', () => {
    expect(formatValue(200.34532, 0, ',')).toBe('200')
    expect(formatValue(200.34532, 1, ',')).toBe('200,3')
    expect(formatValue(200.34532)).toBe('200')
    expect(formatValue(200.34532, 2, '.')).toBe('200.35')
    expect(formatValue(200.34532, 7, '.')).toBe('200.3453200')
    expect(formatValue(0)).toBe('0')
  })
  it('does not break if value is undefined', () => {
    expect(formatValue(undefined)).toBe('')
  })
})
describe('debounce', () => {
  it('call wrapped function only once if it was called more often than waiting period', () => {
    const func = jest.fn()
    const debounceFunc = debounce(func, 400)
    debounceFunc(1)
    jest.advanceTimersByTime(100)
    debounceFunc(2)
    jest.advanceTimersByTime(200)
    debounceFunc(3)
    debounceFunc(4)

    jest.advanceTimersByTime(450)
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith(4)
  })
  it('call wrapped function several times if it was called less often than waiting period', () => {
    const func = jest.fn()
    const debounceFunc = debounce(func, 400)
    debounceFunc(1)
    jest.advanceTimersByTime(200)
    debounceFunc(2)
    jest.advanceTimersByTime(450)
    debounceFunc(3)
    jest.advanceTimersByTime(450)

    expect(func).toHaveBeenCalledTimes(2)
    expect(func).not.toHaveBeenCalledWith(1)
    expect(func).toHaveBeenCalledWith(2)
    expect(func).toHaveBeenLastCalledWith(3)
  })
})

describe('getClosestStep', () => {
  it('returns correct value', () => {
    expect(getClosestStep(120, 500, 5)).toBe(100)
    expect(getClosestStep(180, 500, 5)).toBe(200)
  })
  it('does not break if some data is missing', () => {
    expect(getClosestStep(120, 500)).toBe(120)
    expect(getClosestStep(120)).toBe(120)
    expect(getClosestStep()).toBe(0)
  })
})
describe('evalFuncWithValues', () => {
  it('evaluates function correctly', () => {
    const func = '[first] + 2 * [second]'
    const values = { first: 20, second: 5 }
    expect(evalFuncWithValues(func, values)).toBe(30)
  })
  it('does not break if something is wrong', () => {
    const func1 = 'first + 2 * [second]'
    const values1 = { first: 20, second: 5 }
    const func2 = '[first] + 2 * [second]'
    const values2 = { first: undefined, second: 5 }
    expect(evalFuncWithValues(func1, values1)).toBeUndefined()
    expect(evalFuncWithValues(func2, values2)).toBe(NaN)
  })
})

describe('getSlidersFromHtml', () => {
  it('returns correct array of sliders', () => {
    document.body.innerHTML = `
      <div>
        <div class="slidery" id="first"></div>
        <div class="slidery" id="second" data-range="100...300" data-steps="6" data-initial-value="300"></div>
      </div>
    `
    expect(getSlidersFromHtml()).toMatchSnapshot()
  })
})
describe('getTargetsFromHtml', () => {
  it('returns correct array of sliders', () => {
    document.body.innerHTML = `
      <div>
        <div class="slidery-target"></div>
        <div class="slidery-target" data-precision="2" data-separator="," data-value="[fisrt] + 2 * [second]"></div>
      </div>
    `
    expect(getTargetsFromHtml()).toMatchSnapshot()
  })
})

describe('Slidery', () => {
  Element.prototype.getBoundingClientRect = () => ({
    width: 600,
    height: 30,
    left: 0,
    top: 30
  })
  it('inits correctly from html', () => {
    document.body.innerHTML = `
      <div>
        <div>
          <div class="slidery" id="first"></div>
          <div class="slidery" id="second" data-range="100...300" data-steps="6" data-initial-value="100"></div>
        </div>
        <div>
          <div class="slidery-target"></div>
          <div class="slidery-target" data-precision="2" data-separator="," data-value="[first] + 2 * [second]"></div>
        </div>
      </div>
    `
    const slidery = initFromHtml()
    expect(slidery.sliders).toMatchSnapshot()
    expect(document.getElementById('first')).toMatchSnapshot()
    expect(document.getElementById('second')).toMatchSnapshot()
  })
  it('inits correctly from code', () => {
    document.body.innerHTML = `
      <div>
        <div>
          <div class="slidery" id="first"></div>
          <div class="slidery" id="second" data-range="100...300" data-steps="6" data-initial-value="100"></div>
        </div>
        <div>
          <div class="slidery-target"></div>
          <div class="slidery-target" data-precision="2" data-separator="," data-value="[first] + 2 * [second]"></div>
        </div>
      </div>
    `
    const sliders = getSlidersFromHtml()
    const targets = getTargetsFromHtml()
    const slidery = new Slidery(sliders, targets)
    expect(slidery.sliders).toMatchSnapshot()
    expect(document.getElementById('first')).toMatchSnapshot()
    expect(document.getElementById('second')).toMatchSnapshot()
  })
  it('calls mouse handlers on sliding', () => {
    document.body.innerHTML = `
    <div>
      <div>
        <div class="slidery" id="first" data-range="600...1200"></div>
      </div>
    </div>
    `
    const sliders = getSlidersFromHtml()
    const handleSlidingStart = jest.fn()
    const handleChange = jest.fn()
    const handleSLidingEnd = jest.fn()
    const target = {
      source: 'first',
      onSlidingStart: handleSlidingStart,
      onSlidingEnd: handleSLidingEnd,
      onChange: handleChange
    }
    const slidery = new Slidery(sliders, target)

    // Start sliding
    simulant.fire(document.querySelector('.slidery-lift'), 'mousedown', {
      screenX: 300
    })
    expect(handleSlidingStart).toHaveBeenCalled()
    expect(slidery.sliders.first.nodes).toMatchSnapshot()
    expect(slidery.sliders.first.progress).toBe(300)
    expect(slidery.sliders.first.value).toBe(900)

    // Start sliding
    simulant.fire(document.querySelector('.slidery-lift'), 'mousemove', {
      screenX: 350
    })
    expect(handleChange).toHaveBeenLastCalledWith(950)
    expect(slidery.sliders.first.progress).toBe(300)
    expect(slidery.sliders.first.value).toBe(950)

    // Sliding End
    simulant.fire(document.querySelector('.slidery-lift'), 'mouseup', {
      screenX: 400
    })
    expect(handleSLidingEnd).toHaveBeenCalled()
    expect(handleChange).toHaveBeenLastCalledWith(1000)
    expect(slidery.sliders.first.nodes).toMatchSnapshot()
    expect(slidery.sliders.first.progress).toBe(400)
    expect(slidery.sliders.first.value).toBe(1000)
  })
  it('calls touch handlers on sliding', () => {
    document.body.innerHTML = `
    <div>
      <div>
        <div class="slidery" id="first" data-range="600...1200"></div>
      </div>
    </div>
    `
    const sliders = getSlidersFromHtml()
    const handleSlidingStart = jest.fn()
    const handleChange = jest.fn()
    const handleSLidingEnd = jest.fn()
    const target = {
      source: 'first',
      onSlidingStart: handleSlidingStart,
      onSlidingEnd: handleSLidingEnd,
      onChange: handleChange
    }
    const slidery = new Slidery(sliders, target)
    const getEvent = screenX => ({
      targetTouches: [
        {
          identifier: 'testId',
          screenX
        }
      ],
      changedTouches: [
        {
          identifier: 'testId',
          screenX
        }
      ]
    })

    // Start sliding
    simulant.fire(
      document.querySelector('.slidery-lift'),
      'touchstart',
      getEvent(300)
    )
    expect(handleSlidingStart).toHaveBeenCalled()
    expect(slidery.sliders.first.nodes).toMatchSnapshot()
    expect(slidery.sliders.first.progress).toBe(300)
    expect(slidery.sliders.first.value).toBe(900)

    // Start sliding
    simulant.fire(
      document.querySelector('.slidery-lift'),
      'touchmove',
      getEvent(350)
    )
    expect(handleChange).toHaveBeenLastCalledWith(950)
    expect(slidery.sliders.first.progress).toBe(300)
    expect(slidery.sliders.first.value).toBe(950)

    // Sliding End
    simulant.fire(
      document.querySelector('.slidery-lift'),
      'touchend',
      getEvent(400)
    )
    expect(handleSLidingEnd).toHaveBeenCalled()
    expect(handleChange).toHaveBeenLastCalledWith(1000)
    expect(slidery.sliders.first.nodes).toMatchSnapshot()
    expect(slidery.sliders.first.progress).toBe(400)
    expect(slidery.sliders.first.value).toBe(1000)
  })

  it('handles slider pase click', () => {
    document.body.innerHTML = `
    <div>
      <div>
        <div class="slidery" id="first" data-range="600...1200"></div>
      </div>
    </div>
    `
    const sliders = getSlidersFromHtml()
    const handleSlidingStart = jest.fn()
    const handleChange = jest.fn()
    const handleSLidingEnd = jest.fn()
    const target = {
      source: 'first',
      onSlidingStart: handleSlidingStart,
      onSlidingEnd: handleSLidingEnd,
      onChange: handleChange
    }
    const slidery = new Slidery(sliders, target)
    simulant.fire(document.querySelector('.slidery-base'), 'click', {
      clientX: 250
    })
    expect(handleChange).toHaveBeenLastCalledWith(850)
    expect(slidery.sliders.first.progress).toBe(250)
    expect(slidery.sliders.first.value).toBe(850)
  })
  it('respect steps while calucalting new values', () => {
    document.body.innerHTML = `
    <div>
      <div>
        <div class="slidery" id="first" data-range="600...1200" data-steps="6"></div>
      </div>
    </div>
    `
    const sliders = getSlidersFromHtml()
    const handleSlidingStart = jest.fn()
    const handleChange = jest.fn()
    const handleSLidingEnd = jest.fn()
    const target = {
      source: 'first',
      onSlidingStart: handleSlidingStart,
      onSlidingEnd: handleSLidingEnd,
      onChange: handleChange
    }
    const slidery = new Slidery(sliders, target)
    simulant.fire(document.querySelector('.slidery-base'), 'click', {
      clientX: 250
    })
    expect(handleChange).toHaveBeenLastCalledWith(900)
    expect(slidery.sliders.first.progress).toBe(300)
    expect(slidery.sliders.first.value).toBe(900)
  })
  it('handles window resize event', () => {
    document.body.innerHTML = `
    <div>
      <div>
        <div class="slidery" id="first" data-range="600...1200" data-steps="6"></div>
      </div>
    </div>
    `
    const sliders = getSlidersFromHtml()
    const handleSlidingStart = jest.fn()
    const handleChange = jest.fn()
    const handleSLidingEnd = jest.fn()
    const target = {
      source: 'first',
      onSlidingStart: handleSlidingStart,
      onSlidingEnd: handleSLidingEnd,
      onChange: handleChange
    }
    const slidery = new Slidery(sliders, target)
    expect(slidery.sliders.first.width).toBe(600)

    Element.prototype.getBoundingClientRect = () => ({
      width: 1200,
      height: 30,
      left: 0,
      top: 30
    })

    simulant.fire(document.querySelector('.slidery-base'), 'resize')
    jest.advanceTimersByTime(500)
    expect(slidery.sliders.first.width).toBe(1200)
    expect(slidery.sliders.first.progress).toBe(600)
    expect(slidery.sliders.first.value).toBe(900)
  })
  it('does not initialize if there are no sliders', () => {
    const slidery = new Slidery()
    expect(slidery.sliders).toBeUndefined()
  })
})
