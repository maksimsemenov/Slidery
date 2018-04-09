const path = require('path')

module.exports = {
  entry: {
    slidery: path.resolve(__dirname, './src/slidery.js')
  },
  devtool: 'eval',
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [path.join(__dirname, './src')]
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
        include: [path.join(__dirname, './src')]
      }
    ]
  }
}
