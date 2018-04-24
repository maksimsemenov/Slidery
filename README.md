# Slidery

Slidery is small, lightweight library with no dependencies, that adds sliders to your website. Slidery uses declarative API, so it will be especially helpful for those who do not have coding experience.

## HTML API

---

The easiest way to get started with Slidery is by using its HTML API.

### 1. Add Slidery to the page

First, you need to add Slidery to your webpage either by using [downloaded files](https://github.com/maksimsemenov/slidery/releases) or CDN:

```
// Downloaded file
<script src="slidery.min.js"></script>

// CDN
<script src="https://unpkg.com/slidery"></script>
```

### 2. Set sliders

1.  Add the class `slidery` to the element you want to make a slider from:

    ```
    <div class="slidery"></div>
    ```

2.  Add `id` attribute, so you can link this slider to the targets:

    ```
    <div class="slidery" id="slider-1"></div>
    ```

3.  Add data attributes if you want to customize slider behaviour:

    ```
    <div class="slidery" id="slider-1" data-range="100...500" data-steps="8"></div>
    ```

    | Attribute            | Type                          | Example   | Description                                                                                                                                                      |
    | -------------------- | ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `data-range`         | String in format: `min...max` | 100...500 | Min and max values for the slider. By default range is set from 0 to slider width                                                                                |
    | `data-steps`         | Number                        | 8         | Amount of steps. By default, slider doesn't have steps and user can set any value. If steps amount is set then slider will only switch between fixed step values |
    | `data-initial-value` | Number                        | 200       | Default value. If ommited, slider is set to the medium value                                                                                                     |

### 3. Set targets

1.  Add the class `slidery-target` to the element you want to be a slider target:

    ```
    <div class="slidery-target"></div>
    ```

2.  Add data attributes if you want to customize slider behaviour:
    ```
    <div class="slidery-target" data-value="2 * [slider-1]"></div>
    ```
    | Attribute        | Type                 | Example         | Description                                                                                                                                                                                                                                                                             |
    | ---------------- | -------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `data-value`     | String with function | 2 \* [sliderId] | Function that will be executed with slider value on slider move. Any target can depend on any amount of sliders. You just need to put an id for each slider, i.e. `[slider-1] + [slider-2]`.Under the hood it uses js `eval` function, so don't put here content from untrusted sources |
    | `data-precision` | Number               | 2               | Number of digits after decimal point, that you want to round the target value. By default it is `0`                                                                                                                                                                                     |
    | `data-separator` | String               | ,               | The symbol that will be used as decimal point. By default it is `.`                                                                                                                                                                                                                     |

### 4. Styling

Slidery uses `currentColor` css variable, to set slider progress and slider lift colors. Thus if you set a css `color` property for the slider container, slidery will use that.
Slidery also adds `slider-is-sliding` class to the active slider lift and targets, so you can style the active states too.

---

## JS API

You can initialize Slidery in code too

### 1. Add Slidery to you project

In case you're using bundle tools like Webpack or Rollup, you can install slidery from npm:

```
$ npm install slidery --save
```

or yarn:

```
$ yarn add slidery
```

### 2. Init Slidery

Slider initialiser accepts two params: slider or array of sliders and target or array of targets:

```
const slidery = new Slidery(slider, target)

// or
const slidery new Slidery(slidersArray, targetsArray)
```

**Slider object**
|Property|Type|Required|Description|
|---|---|---|---|
|`id`|String|yes|Unique slider id
|`node`|DOM node|yes|DOM element that will be used as a container for slider|
|`range`|Array||Array with min and max values, e.g. `[100, 500]`|
|`steps`|Number||Number of steps|
|`value`|Number||Default number|

**Target object**
|Property|Type|Required|Description|
|---|---|---|---|
|`source`|String or Array of strings|yes|Id or array of slider ids|
|`node`|DOM node|yes|DOM element that will be used as a container for target|
|`onChange`|Function||A callback function that will be called on slider change. If source is a string it will get a slider value, if source is an array of ids, than function will get an object `{ sliderOneId: valueOne, sliderTwoId: valueTwo, ... }`|
|`onSlidingStart`|Function||Callback function that will be called on sliding start. It takes no arguments|
|`onClidingEnd`|Function||Callback function that will be called on sliding end. It takes no arguments|
