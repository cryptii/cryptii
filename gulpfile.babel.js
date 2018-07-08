
import autoprefixer from 'gulp-autoprefixer'
import babel from 'rollup-plugin-babel'
import cleanCSS from 'gulp-clean-css'
import clone from 'gulp-clone'
import commonJs from 'rollup-plugin-commonjs'
import concat from 'gulp-concat'
import del from 'del'
import gulp from 'gulp'
import header from 'gulp-header'
import mocha from 'gulp-mocha'
import nodeResolve from 'rollup-plugin-node-resolve'
import rename from 'gulp-rename'
import revision from 'git-rev-sync'
import rollup from 'gulp-better-rollup'
import sass from 'gulp-sass'
import sassSVGInliner from 'sass-inline-svg'
import sourcemaps from 'gulp-sourcemaps'
import standard from 'gulp-standard'
import streamQueue from 'streamqueue'
import uglify from 'gulp-uglify'

const meta = require('./package.json')
const paths = {
  assets: './assets',
  script: './src',
  scriptDist: './public/dist/script',
  style: './style',
  styleDist: './public/dist/style',
  test: './test'
}

// try to retrieve current commit hash
let distRevision
try {
  distRevision = revision.long()
} catch (evt) {
  distRevision = 'unknown'
}

// compose dist header
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
        'babel-core/register',
        'babel-polyfill'
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
            ['env', {
              loose: true,
              modules: false
            }]
          ],
          plugins: [
            'external-helpers',
            ['babel-plugin-transform-builtin-extend', {
              globals: ['Error']
            }]
          ],
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

    // set output filename
    .pipe(rename(`${meta.name}.js`))

    // minify code
    .pipe(uglify())

    // append header
    .pipe(header(distHeader))

  // create polyfill stream from existing files
  const polyfillStream = gulp.src([
    './node_modules/dom4/build/dom4.js',
    './node_modules/babel-polyfill/dist/polyfill.min.js'
  ], { base: '.' })
    .pipe(sourcemaps.init())

  // compose library bundle
  const libraryBundleStream = appStream.pipe(clone())
    // render sourcemaps
    .pipe(sourcemaps.write('.'))

  // compose browser bundle
  const browserBundleStream =
    streamQueue({ objectMode: true }, polyfillStream, appStream)
      // concat polyfill and library
      .pipe(concat(`${meta.name}-browser.js`))
      // render sourcemaps
      .pipe(sourcemaps.write('.'))

  // save bundles and sourcemaps
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

    // init sourcemaps
    .pipe(sourcemaps.init())

    // compile sass to css
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

    // autoprefix css
    .pipe(autoprefixer('last 2 version', 'ie 11', '> 1%'))

    // minify
    .pipe(cleanCSS({ processImport: false }))

    // append header
    .pipe(header(distHeader))

    // save result
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
    'script-test'
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
