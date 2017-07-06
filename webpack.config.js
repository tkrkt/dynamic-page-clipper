module.exports = {
  entry: './content.babel.jsx',
  output: {
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