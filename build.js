const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const postcss = require('rollup-plugin-postcss')
const uglify = require('rollup-plugin-uglify')

const bundles = [
  {
    format: 'cjs',
    ext: '.js',
    babelPresets: ['env']
  },
  {
    format: 'es',
    ext: '.mjs'
  },
  {
    format: 'cjs',
    ext: '.browser.js'
  },
  {
    entry: 'index.js',
    format: 'umd',
    ext: '.js',
    moduleName: 'slidery'
  },
  {
    entry: 'index.js',
    format: 'umd',
    ext: '.min.js',
    plugins: [uglify()],
    moduleName: 'slidery',
    minify: true
  }
]

bundles.forEach(async config => {
  try {
    const bundle = await rollup.rollup({
      input: `src/${config.entry || 'slidery.js'}`,
      plugins: [
        // less(),
        postcss(),
        babel({
          exclude: 'node_modules/**',
          plugins: ['external-helpers']
        })
      ].concat(config.plugins || [])
    })
    await bundle.write({
      file: `dist/${config.moduleName || 'main'}${config.ext}`,
      format: config.format,
      sourceMap: !config.minify,
      name: config.moduleName,
      exports: 'named'
    })
  } catch (err) {
    console.error(err) //eslint-disable-line no-console
    console.error(err.stack) //eslint-disable-line no-console
  }
})
