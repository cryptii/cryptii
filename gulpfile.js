
const autoprefixer = require('gulp-autoprefixer')
const babel = require('rollup-plugin-babel')
const cleanCSS = require('gulp-clean-css')
const clone = require('gulp-clone')
const commonJs = require('rollup-plugin-commonjs')
const concat = require('gulp-concat')
const del = require('del')
const gulp = require('gulp')
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

// Try to retrieve current commit hash
let distRevision
try {
  distRevision = revision.long()
} catch (err) {
  distRevision = 'unknown'
}

// Compose dist header
const distHeader =
  `/*! ${meta.name} v${meta.version} (commit ${distRevision})` +
  ` - (c) ${meta.author} */\n`

gulp.task('script-clean', () => {
  return del([paths.scriptDist])
})

gulp.task('script-test-lint', () => {
  return gulp.src(paths.test + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('script-test', () => {
  return gulp.src(paths.test + '/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'dot',
      require: [
        '@babel/polyfill',
        '@babel/register'
      ]
    }))
})

gulp.task('script-lint', () => {
  return gulp.src(paths.script + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('script', () => {
  const appStream = gulp.src(paths.script + '/index.js')
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
          jsnext: true,
          main: true
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
    .pipe(header(distHeader))

  // Create polyfill stream from existing files
  const polyfillStream = gulp.src([
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
      .pipe(gulp.dest(paths.scriptDist))

  return projectStream
})

gulp.task('style-clean', () => {
  return del([paths.styleDist])
})

gulp.task('style', () => {
  return gulp.src(paths.style + '/main.scss')

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
    .pipe(header(distHeader))

    // Save result
    .pipe(rename(meta.name + '.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styleDist))
})

gulp.task('watch', () => {
  gulp.watch(paths.script + '/**/*.js', gulp.series(
    'script-lint',
    'script-test',
    'script-clean',
    'script'
  ))

  gulp.watch(paths.test + '/**/*.js', gulp.series(
    'script-test-lint',
    'script-test',
    'script-lint',
    'script-clean',
    'script'
  ))

  gulp.watch(paths.style + '/**/*.scss', gulp.series(
    'style-clean',
    'style'
  ))
})

gulp.task('test', gulp.series(
  gulp.parallel('script-lint', 'script-test-lint'),
  'script-test'
))

gulp.task('build', gulp.series(
  'test',
  gulp.parallel('script-clean', 'style-clean'),
  gulp.parallel('script', 'style')
))

gulp.task('default', gulp.series(
  'build',
  'watch'
))
