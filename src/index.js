import Slidery from './slidery'
;(function() {
  const sliderNodes = [].slice.call(
    document.querySelectorAll(`.slidery-custom`)
  )
  const sliders = sliderNodes.map(node => ({
    element: node,
    range: node.dataset.range.split('...').map(i => parseInt(i, 10)),
    id: node.id
  }))
  const target = {
    source: ['red', 'blue', 'green'],
    onChange: values => {
      const { red, green, blue } = values
      const color = `rgb(${red.toFixed(0)}, ${green.toFixed(0)}, ${blue.toFixed(
        0
      )})`
      sliderNodes.forEach(node => (node.style.color = color))
    }
  }
  window.colorSliders = new Slidery(sliders, target)
})()
