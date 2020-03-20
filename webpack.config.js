
const meta = require('./package.json')
const autoprefixer = require('autoprefixer')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const revision = require('git-rev-sync')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

/**
 * Composes a banner including package name, author, year and version which is
 * included in every output file.
 * @return {string}
 */
function composeOutputBanner () {
  const { name, author, version } = meta
  const year = new Date().getFullYear()
  return `/*! ${name} v${version} - (c) ${author} ${year} */`
}

/**
 * Returns the brick name for the given file path or null, if it is not a brick.
 * @param {object} module Webpack module object
 * @return {string|null} Brick name or null
 */
function deriveBrickNameFromModule(module) {
  // Iterate through issuer parents to find a brick module and retrieve its name
  let name = null
  let current = module
  let matches
  while (name === null && current !== null) {
    matches = /[\\/]bricks[\\/](.*)[\\/]/.exec(current.identifier())
    if (matches) {
      name = `bricks/${matches[1]}`
    }
    current = current.issuer
  }
  return name
}

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.ts',
  },
  devtool: 'source-map',
  module: {
    rules: [
      // Handle TypeScript, JavaScript, JSX files
      {
        test: /\.(ts|tsx|js|jsx)x?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      // Handle SASS and CSS files
      {
        test: /\.(sass|scss|css)$/i,
        use: [
          MiniCSSExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {}
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer],
            },
          },
          {
            loader: 'sass-loader',
            options: {}
          }
        ]
      },
      // Handle inline SVG assets
      {
        test: /\.svg$/i,
        loader: 'svg-inline-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'src/library'),
      'node_modules',
    ],
  },
  output: {
    filename: `${meta.name}.js`,
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/',
  },
  plugins: [
    // Cleans the dist folder before building
    new CleanWebpackPlugin(),
    new MiniCSSExtractPlugin({
      // Configure CSS output
      filename: `${meta.name}.css`,
    }),
    // Configure the output dist banner
    new webpack.BannerPlugin({
      banner: composeOutputBanner,
      raw: true
    })
  ],
  optimization: {
    minimizer: [
      // JavaScript minification
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {},
        extractComments: false
      })
    ],
    splitChunks: {
      cacheGroups: {
        bricks: {
          // Create a chunk for each brick not included in the library
          test: module => deriveBrickNameFromModule(module) !== null,
          name: module => deriveBrickNameFromModule(module),
          chunks: 'async',
          enforce: true,
        }
      }
    }
  }
}
