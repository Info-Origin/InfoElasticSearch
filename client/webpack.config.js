const path = require('path');

module.exports = {
  entry: './src/index.js', // Specify the entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Specify the output directory
    filename: 'bundle.js', // Specify the output filename
  },
  module: {
    rules: [
      // Add your loaders and rules for handling different file types
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      querystring: require.resolve('querystring-es3'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      console: require.resolve('console-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
  },

  plugins: [
    // other plugins...
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};


