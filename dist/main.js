'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".slidery {\n  position: relative;\n}\n.slidery-target {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n}\n.slidery-no-select-text {\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  cursor: -webkit-grabbing;\n  cursor: grabbing;\n}\n.slidery-base {\n  position: relative;\n  width: 100%;\n  min-height: 2px;\n  cursor: pointer;\n  background-color: #f0f0f0;\n}\n.slidery-base__target {\n  position: absolute;\n  left: 0;\n  top: 50%;\n  width: 100%;\n  height: 100%;\n  min-height: 30px;\n  -webkit-transform: translateY(-50%);\n      -ms-transform: translateY(-50%);\n          transform: translateY(-50%);\n  cursor: pointer;\n}\n.slidery-progress {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 50%;\n  pointer-events: none;\n  background-color: currentColor;\n}\n.slidery-lift {\n  position: absolute;\n  cursor: -webkit-grab;\n  cursor: grab;\n  top: 50%;\n  min-height: 20px;\n  min-width: 20px;\n  left: 50%;\n  -webkit-transform: translate(-50%, -50%);\n      -ms-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n}\n@media (max-width: 576px) {\n  .slidery-lift {\n    min-width: 40px;\n    min-height: 40px;\n  }\n}\n.slidery-lift::before {\n  content: '';\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translate(-50%, -50%);\n      -ms-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  min-height: 10px;\n  min-width: 10px;\n  border-radius: 50%;\n  background-color: currentColor;\n  -webkit-transition: -webkit-transform 0.1s ease-out, -webkit-box-shadow 0.1s ease-out;\n  transition: -webkit-transform 0.1s ease-out, -webkit-box-shadow 0.1s ease-out;\n  -o-transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;\n  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;\n  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out, -webkit-transform 0.1s ease-out, -webkit-box-shadow 0.1s ease-out;\n}\n@media (max-width: 576px) {\n  .slidery-lift::before {\n    min-width: 20px;\n    min-height: 20px;\n  }\n}\n.slidery-lift:hover::before,\n.slidery-lift.slidery-is-sliding::before {\n  -webkit-transform: translate(-50%, -50%) scale(1.7);\n      -ms-transform: translate(-50%, -50%) scale(1.7);\n          transform: translate(-50%, -50%) scale(1.7);\n  -webkit-box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);\n          box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);\n}\n.slidery-lift.slidery-is-sliding::before {\n  cursor: -webkit-grabbing;\n  cursor: grabbing;\n}\n.slidery-lift.slidery-is-sliding {\n  cursor: -webkit-grabbing;\n  cursor: grabbing;\n}\n";
styleInject(css);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var initNodes = function initNodes(node) {
  var wrapperNode = node;
  var baseNode = wrapperNode.querySelector('.slidery-base');
  var progressNode = wrapperNode.querySelector('.slidery-progress');
  var liftNode = wrapperNode.querySelector('.slidery-lift');

  if (!wrapperNode.classList.contains('slidery')) {
    wrapperNode.classList.add('slidery');
  }

  if (!baseNode) {
    baseNode = document.createElement('div');
    baseNode.classList.add('slidery-base');
  }
  var baseTargetNode = document.createElement('div');
  baseTargetNode.classList.add('slidery-base__target');
  baseNode.append(baseTargetNode);

  if (!progressNode) {
    progressNode = document.createElement('div');
    progressNode.classList.add('slidery-progress');
  }
  if (!liftNode) {
    liftNode = document.createElement('div');
    liftNode.classList.add('slidery-lift');
  }

  wrapperNode.append(baseNode);
  wrapperNode.append(progressNode);
  wrapperNode.append(liftNode);
  return { wrapperNode: wrapperNode, baseNode: baseNode, progressNode: progressNode, liftNode: liftNode };
};

var formatValue = function formatValue(value) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var separator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.';

  if (value === undefined || value === null) return '';
  var formattedValue = value.toFixed(precision);
  if (separator !== '.') {
    return formattedValue.replace('.', separator);
  }
  return formattedValue;
};
var debounce = function debounce(func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  var timer = void 0;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      func.apply(undefined, args);
    }, wait);
  };
};
var funcIdRegExp = /\[[\w-_\.]+\]/gi;

var getClosestStep = function getClosestStep(value, range, stepsCount) {
  if (!value) return 0;
  if (!(stepsCount && range)) return value;
  var step = range / stepsCount;
  return Math.round(value / step) * step;
};

var evalFuncWithValues = function evalFuncWithValues(func, values) {
  var funcWithValues = Object.keys(values).reduce(function (tempFunc, id) {
    return tempFunc.replace(new RegExp('\\[' + id + '\\]', 'g'), values[id]);
  }, func);

  try {
    return eval(funcWithValues);
  } catch (e) {
    return undefined;
  }
};

var getSlidersFromHtml = function getSlidersFromHtml() {
  var className = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'slidery';
  return [].slice.call(document.querySelectorAll('.' + className)).map(function (node) {
    var range = node.dataset.range && /-?\d+\.\.\.-?\d+/.test(node.dataset.range) ? node.dataset.range.split('...').map(function (i) {
      return parseInt(i, 10);
    }) : undefined;

    var value = node.dataset.initialValue && parseInt(node.dataset.initialValue, 10);

    return {
      element: node,
      range: range,
      value: value,
      id: node.id,
      steps: node.dataset.steps ? parseInt(node.dataset.steps, 10) : undefined
    };
  });
};

var getTargetsFromHtml = function getTargetsFromHtml() {
  var className = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'slidery-target';
  return [].slice.call(document.querySelectorAll('.' + className)).map(function (node) {
    var precision = node.dataset.precision || 0;
    var separator = node.dataset.separator || '';

    var source = node.dataset.value ? node.dataset.value.match(funcIdRegExp).map(function (match) {
      return match.replace(/\[?\]?/g, '');
    }).reduce(function (sourceSet, id) {
      if (sourceSet.indexOf(id) === -1) {
        return [].concat(toConsumableArray(sourceSet), [id]);
      }
      return sourceSet;
    }, []) : undefined;

    var onChange = source && source.length > 1 ? function (values) {
      node.innerHTML = formatValue(evalFuncWithValues(node.dataset.value, values), precision, separator);
    } : function (value) {
      return node.innerHTML = formatValue(value, precision, separator);
    };
    return {
      node: node,
      source: source,
      onSlidingStart: function onSlidingStart() {
        return node.classList.add('slidery-is-sliding');
      },
      onSlidingEnd: function onSlidingEnd() {
        return node.classList.remove('slidery-is-sliding');
      },
      onChange: onChange
    };
  });
};

var initFromHtml = function initFromHtml(sliderClass, targetClass) {
  var slidersArray = getSlidersFromHtml(sliderClass);
  var targetsArray = getTargetsFromHtml(targetClass);
  if (slidersArray.length && targetsArray.length) {
    return new Slidery(slidersArray, targetsArray);
  }
};

/*
*  Slidery class
*/

var Slidery = function Slidery(sliders, targets) {
  var _this = this;

  classCallCheck(this, Slidery);

  _initialiseProps.call(this);

  if (!(Array.isArray(sliders) && sliders.length > 0 || (typeof sliders === 'undefined' ? 'undefined' : _typeof(sliders)) === 'object')) {
    return undefined;
  }
  this.sliders = {};
  this.activeSliders = {};
  this.listeners = {};

  var slidersArray = Array.isArray(sliders) ? sliders : [sliders];
  var targetsArray = Array.isArray(targets) && targets.length ? targets : (typeof targets === 'undefined' ? 'undefined' : _typeof(targets)) === 'object' ? [targets] : [];
  slidersArray.filter(function (slider) {
    return slider && (slidersArray.length === 1 ? true : !!slider.id);
  }).forEach(function (_ref) {
    var _ref$id = _ref.id,
        id = _ref$id === undefined ? (Math.random() * 4000).toString() : _ref$id,
        element = _ref.element,
        initialRange = _ref.range,
        value = _ref.value,
        steps = _ref.steps;

    if (!element) return;
    var targets = targetsArray.map(function (target) {
      var source = target.source;
      if (typeof source === 'string') source = [source];
      if (Number.isInteger(source)) source = [source.toString()];
      if (!(Array.isArray(source) || source === undefined || source === null)) source = slidersArray.length === 1 ? [id] : undefined;

      return Object.assign({}, target, { source: source });
    }).filter(function (_ref2) {
      var source = _ref2.source;
      return source && source.indexOf(id) !== -1;
    });

    var width = element.getBoundingClientRect().width;
    var range = Array.isArray(initialRange) && initialRange.length === 2 ? initialRange : [0, width];
    var scale = width / (range[1] - range[0]);

    var initialValue = void 0,
        initialProgress = void 0;
    if (value) {
      initialValue = value;
      if (initialValue < range[0]) initialValue = range[0];
      if (initialValue > range[1]) initialValue = range[1];
      initialProgress = (initialValue - range[0]) * scale;
    } else {
      initialProgress = width / 2;
      initialValue = range[0] + initialProgress / scale;
    }

    var listeners = {
      baseClick: _this.handleBaseNodeClick(id),
      liftMouseDown: _this.handleLiftNodeMouseDown(id),
      touchStart: _this.handleLiftNodeTouchStart(id)
    };
    _this.listeners[id] = listeners;

    var nodes = initNodes(element);
    nodes.baseNode.addEventListener('click', listeners.baseClick);
    nodes.liftNode.addEventListener('mousedown', listeners.liftMouseDown);
    nodes.liftNode.addEventListener('touchstart', listeners.touchStart);

    var liftPosition = initialProgress / width * 100;
    nodes.liftNode.style.left = liftPosition + '%';
    nodes.progressNode.style.width = liftPosition + '%';

    _this.sliders[id] = {
      id: id,
      nodes: nodes,
      targets: targets,
      width: width,
      range: range,
      scale: scale,
      stepsCount: steps ? steps : undefined,
      value: initialValue,
      progress: initialProgress
    };
  });

  Object.values(this.sliders).forEach(function (slider) {
    _this.adjustTargets(slider.targets, _this.sliders);
  });
  window.addEventListener('resize', debounce(this.handleWindowResize, 300));
}

// Window handlers


// Handers


// Helpers
;

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.handleWindowResize = function () {
    Object.values(_this2.sliders).forEach(function (slider) {
      var newWidth = slider.nodes.baseNode.getBoundingClientRect().width;
      slider.progress = slider.progress / slider.width * newWidth;
      slider.width = newWidth;
      slider.scale = newWidth / (slider.range[1] - slider.range[0]);
    });
  };

  this.handleBaseNodeClick = function (id) {
    return function (event) {
      var progress = event.offsetX;
      if (progress === undefined || progress === null) {
        var left = event.target.getBoundingClientRect().left;
        progress = event.clientX - left;
      }
      _this2.adjustSlider(id, progress, true);
    };
  };

  this.handleLiftNodeMouseDown = function (id) {
    return function (event) {
      var slider = _this2.sliders[id];
      if (!slider) return;
      _this2.activeSliders[id] = {
        initialScreenPosition: event.screenX,
        initialProgress: slider.progress
      };
      _this2.initSliderBeforeSliding(id, 'mouse');
    };
  };

  this.handleLiftNodeTouchStart = function (id) {
    return function (event) {
      var slider = _this2.sliders[id];
      if (!slider) return;
      var touches = [].slice.call(event.targetTouches);
      var touch = touches.length && touches[0];
      if (!touch) return;
      _this2.activeSliders[id] = {
        initialScreenPosition: touch.screenX,
        touchId: touch.identifier,
        initialProgress: slider.progress
      };
      _this2.initSliderBeforeSliding(id, 'touch');
    };
  };

  this.handleMouseUp = function (id) {
    return function (event) {
      var activeSlider = _this2.activeSliders[id];
      if (!activeSlider) return;

      var initialProgress = activeSlider.initialProgress,
          initialScreenPosition = activeSlider.initialScreenPosition;

      var progress = initialProgress + event.screenX - initialScreenPosition;
      _this2.adjustSlider(id, progress, true);
      _this2.cleanupSliderAfterSliding(id, 'mouse');
    };
  };

  this.handleTouchEnd = function (id) {
    return function (event) {
      var activeSlider = _this2.activeSliders[id];
      if (!activeSlider) return;

      var initialProgress = activeSlider.initialProgress,
          initialScreenPosition = activeSlider.initialScreenPosition,
          touchId = activeSlider.touchId;

      var touch = [].slice.call(event.changedTouches).find(function (t) {
        return t.identifier === touchId;
      });
      if (!touch) return;

      var progress = initialProgress + touch.screenX - initialScreenPosition;
      _this2.adjustSlider(id, progress, true);
      _this2.cleanupSliderAfterSliding(id, 'touch');
    };
  };

  this.handleMouseMove = function (id) {
    var activeSlider = _this2.activeSliders[id];
    if (!activeSlider) return;

    var initialProgress = activeSlider.initialProgress,
        initialScreenPosition = activeSlider.initialScreenPosition;

    return function (event) {
      var progress = initialProgress + event.screenX - initialScreenPosition;
      _this2.adjustSlider(id, progress);
    };
  };

  this.handleTouchMove = function (id) {
    var activeSlider = _this2.activeSliders[id];
    if (!activeSlider) return;

    var initialProgress = activeSlider.initialProgress,
        initialScreenPosition = activeSlider.initialScreenPosition,
        touchId = activeSlider.touchId;

    return function (event) {
      var touch = [].slice.call(event.changedTouches).find(function (t) {
        return t.identifier === touchId;
      });
      if (!touch) return;

      var progress = initialProgress + touch.screenX - initialScreenPosition;
      _this2.adjustSlider(id, progress);
    };
  };

  this.initSliderBeforeSliding = function (id, handlerType) {
    var moveHandlerName = handlerType === 'mouse' ? 'MouseMove' : 'TouchMove';
    var stopHandlerName = handlerType === 'mouse' ? 'MouseUp' : 'TouchEnd';

    var handleMove = _this2['handle' + moveHandlerName](id);
    var handleStop = _this2['handle' + stopHandlerName](id);
    _this2.listeners[id][moveHandlerName.toLowerCase()] = handleMove;
    _this2.listeners[id][stopHandlerName.toLowerCase()] = handleStop;
    document.addEventListener(moveHandlerName.toLowerCase(), handleMove);
    document.addEventListener(stopHandlerName.toLowerCase(), handleStop);

    document.body.classList.add('slidery-no-select-text');
    var slider = _this2.sliders[id];
    if (slider) {
      slider.nodes.liftNode.classList.add('slidery-is-sliding');
      slider.targets.forEach(function (target) {
        return target.onSlidingStart && target.onSlidingStart();
      });
    }
  };

  this.cleanupSliderAfterSliding = function (id, handlerType) {
    _this2.activeSliders[id] = null;
    var listeners = _this2.listeners[id];
    if (listeners) {
      var moveHandlerName = handlerType + 'move';
      var stopHandlerName = handlerType === 'mouse' ? 'mouseup' : 'touchend';
      listeners[moveHandlerName] && document.removeEventListener(moveHandlerName, listeners[moveHandlerName]);
      listeners[stopHandlerName] && document.removeEventListener(stopHandlerName, listeners[stopHandlerName]);
      _this2.listeners[id] = {};
    }
    document.body.classList.remove('slidery-no-select-text');
    var slider = _this2.sliders[id];
    if (slider) {
      slider.nodes.liftNode.classList.remove('slidery-is-sliding');
      slider.targets.forEach(function (target) {
        return target.onSlidingEnd && target.onSlidingEnd();
      });
    }
  };

  this.adjustTargets = function (targets, sliders) {
    targets.forEach(function (_ref3) {
      var onChange = _ref3.onChange,
          source = _ref3.source;

      if (!(onChange && Array.isArray(source))) return;
      onChange(source.length === 1 ? sliders[source[0]].value : source.filter(function (id) {
        return !!sliders[id];
      }).reduce(function (values, id) {
        values[id] = sliders[id].value;
        return values;
      }, {}));
    });
  };

  this.adjustSlider = function (id, progress) {
    var setNewProgress = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var slider = _this2.sliders[id];
    if (!slider) return;

    var newProgress = progress;
    if (slider && slider.stepsCount) newProgress = getClosestStep(progress, slider.width, slider.stepsCount);
    if (newProgress < 0) newProgress = 0;
    if (newProgress > slider.width) newProgress = slider.width;

    var newValue = slider.range[0] + newProgress / slider.scale;
    var newPosition = newProgress / slider.width * 100;

    slider.nodes.liftNode.style.left = newPosition + '%';
    slider.nodes.progressNode.style.width = newPosition + '%';
    slider.value = newValue;

    if (setNewProgress) {
      slider.progress = newProgress;
    }
    _this2.adjustTargets(slider.targets, _this2.sliders);
  };
};

exports.initNodes = initNodes;
exports.formatValue = formatValue;
exports.debounce = debounce;
exports.getClosestStep = getClosestStep;
exports.evalFuncWithValues = evalFuncWithValues;
exports.getSlidersFromHtml = getSlidersFromHtml;
exports.getTargetsFromHtml = getTargetsFromHtml;
exports.initFromHtml = initFromHtml;
exports.default = Slidery;
