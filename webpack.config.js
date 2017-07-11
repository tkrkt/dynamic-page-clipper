const path = require('path');
module.exports = {
  entry: path.join(__dirname, 'package', 'content.babel.jsx'),
  output: {
    path: path.join(__dirname, 'package'),
    filename: 'content.js',
    libraryTarget: 'umd'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};