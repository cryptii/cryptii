
const { src, dest, parallel, series, watch } = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('rollup-plugin-babel')
const cleanCSS = require('gulp-clean-css')
const clone = require('gulp-clone')
const commonJs = require('rollup-plugin-commonjs')
const concat = require('gulp-concat')
const del = require('del')
const header = require('gulp-header')
const mocha = require('gulp-mocha')
const nodeResolve = require('rollup-plugin-node-resolve')
const rename = require('gulp-rename')
const revision = require('git-rev-sync')
const rollup = require('gulp-better-rollup')
const sass = require('gulp-sass')
const sassSVGInliner = require('sass-inline-svg')
const sourcemaps = require('gulp-sourcemaps')
const standard = require('gulp-standard')
const streamQueue = require('streamqueue')
const uglify = require('gulp-uglify')

const meta = require('./package.json')
const paths = {
  assets: './assets',
  script: './src',
  scriptDist: './dist/script',
  style: './style',
  styleDist: './dist/style',
  test: './test'
}

function composeDistHeader () {
  // Try to retrieve current commit hash
  let distRevision
  try {
    distRevision = revision.long()
  } catch (err) {
    distRevision = 'unknown'
  }

  // Compose dist header
  return `/*! ${meta.name} v${meta.version} (commit ${distRevision})` +
         ` - (c) ${meta.author} ${new Date().getFullYear()} */\n`
}

function scriptClean () {
  return del([paths.scriptDist])
}

function scriptTestLint () {
  return src(paths.test + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
}

function scriptTest () {
  return src(paths.test + '/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'dot',
      require: [
        '@babel/polyfill',
        '@babel/register'
      ]
    }))
}

function scriptLint () {
  return src(paths.script + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
}

function script () {
  const appStream = src(paths.script + '/index.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      external: ['crypto'],
      plugins: [
        babel({
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              loose: true,
              modules: false
            }]
          ],
          plugins: [],
          exclude: ['node_modules/**']
        }),
        nodeResolve({
          mainFields: ['module', 'main']
        }),
        commonJs({
          include: ['node_modules/**'],
          ignore: ['os']
        })
      ]
    }, {
      format: 'umd',
      name: meta.name,
      globals: {
        crypto: 'crypto'
      }
    }))

    // Set output filename
    .pipe(rename(`${meta.name}.js`))

    // Minify code
    .pipe(uglify({
      // Compression in Uglify 3.4.9 breaks execution order:
      // https://github.com/mishoo/UglifyJS2/issues/3278
      compress: {
        conditionals: false
      }
    }))

    // Append header
    .pipe(header(composeDistHeader()))

  // Create polyfill stream from existing files
  const polyfillStream = src([
    './node_modules/dom4/build/dom4.js',
    './node_modules/@babel/polyfill/dist/polyfill.min.js'
  ], { base: '.' })
    .pipe(sourcemaps.init())

  // Compose library bundle
  const libraryBundleStream = appStream.pipe(clone())
    // Render sourcemaps
    .pipe(sourcemaps.write('.'))

  // Compose browser bundle
  const browserBundleStream =
    streamQueue({ objectMode: true }, polyfillStream, appStream)
      // Concat polyfill and library
      .pipe(concat(`${meta.name}-browser.js`))
      // Render sourcemaps
      .pipe(sourcemaps.write('.'))

  // Save bundles and sourcemaps
  const projectStream =
    streamQueue({ objectMode: true }, libraryBundleStream, browserBundleStream)
      .pipe(dest(paths.scriptDist))

  return projectStream
}

function styleClean () {
  return del([paths.styleDist])
}

function style () {
  return src(paths.style + '/main.scss')

    // Init sourcemaps
    .pipe(sourcemaps.init())

    // Compile sass to css
    .pipe(
      sass({
        includePaths: ['node_modules'],
        outputStyle: 'expanded',
        functions: {
          'inline-svg': sassSVGInliner(paths.assets)
        }
      })
        .on('error', sass.logError)
    )

    // Autoprefix css
    .pipe(autoprefixer('last 2 version', 'ie 11', '> 1%'))

    // Minify
    .pipe(cleanCSS({ processImport: false }))

    // Append header
    .pipe(header(composeDistHeader()))

    // Save result
    .pipe(rename(meta.name + '.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styleDist))
}

// Task watch
function watchFiles () {
  watch(paths.script + '/**/*.js',
    series(scriptLint, scriptTest, scriptClean, script))
  watch(paths.test + '/**/*.js',
    series(scriptTestLint, scriptTest, scriptLint, scriptClean, script))
  watch(paths.style + '/**/*.scss',
    series(styleClean, style))
}

watchFiles.description =
  'Watches style, src and test files and triggers partial builds upon changes'
exports.watch = watchFiles

// Task test
const test = series(parallel(scriptLint, scriptTestLint), scriptTest)
test.description = 'Runs source code linters and package tests.'
exports.test = test

// Task build
const build = series(
  test,
  parallel(scriptClean, styleClean),
  parallel(script, style)
)
build.description = 'Builds package into the `dist` folder when tests succeed.'
exports.build = build

// Default task
const all = parallel(build, watchFiles)
all.description = 'Tests and builds package initially and on file change'
exports.default = all
