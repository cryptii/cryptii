
import autoprefixer from 'gulp-autoprefixer'
import babel from 'rollup-plugin-babel'
import buffer from 'vinyl-buffer'
import cleanCSS from 'gulp-clean-css'
import clone from 'gulp-clone'
import commonJs from 'rollup-plugin-commonjs'
import concat from 'gulp-concat'
import del from 'del'
import esdoc from 'gulp-esdoc-stream'
import gulp from 'gulp'
import header from 'gulp-header'
import mergeStream from 'merge-stream'
import mocha from 'gulp-mocha'
import nodeResolve from 'rollup-plugin-node-resolve'
import rename from 'gulp-rename'
import revision from 'git-rev-sync'
import rollup from 'rollup-stream'
import sass from 'gulp-sass'
import sassSVGInliner from 'sass-inline-svg'
import source from 'vinyl-source-stream'
import sourcemaps from 'gulp-sourcemaps'
import standard from 'gulp-standard'
import uglify from 'gulp-uglify'

let meta = require('./package.json')
let distHeader =
  `/*! ${meta.name} v${meta.version} (commit ${revision.long()})` +
  ` - (c) ${meta.author} */\n`

let paths = {
  assets: './assets',
  script: './src',
  scriptDist: './public/dist/script',
  style: './style',
  styleDist: './public/dist/style',
  test: './test',
  doc: './public/docs',
}

gulp.task('lint-test', () => {
  return gulp.src(paths.test + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('lint-script', () => {
  return gulp.src(paths.script + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('test', ['lint-test', 'lint-script'], () => {
  return gulp.src(paths.test + '/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'spec',
      compilers: [
        'js:babel-core/register'
      ]
    }))
})

gulp.task('doc', ['clean-doc'], () => {
  return gulp.src(paths.script + '/**/*.js')
    .pipe(esdoc({
      destination: paths.doc,
      title: 'Cryptii',
      test: {
        type: 'mocha',
        source: paths.test,
        includes: ['.js$'],
      }
    }))
})

let rollupCache

gulp.task('script', ['lint-script', 'clean-script'], () => {
  let appStream = rollup({
    input: paths.script + '/index.js',
    external: [
    ],
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
        include: ['node_modules/**']
      })
    ],
    format: 'umd',
    sourcemap: true,
    cache: rollupCache,
    amd: { id: meta.name }
  })

  appStream = appStream
    // enable rollup cache
    .on('bundle', (bundle) => {
      rollupCache = bundle
    })

    // handle errors gracefully
    .on('error', err => {
      console.error(err.message)
      if (err.codeFrame !== undefined) {
        console.error(err.codeFrame)
      }
      stream.emit('end')
    })

    // set output filename
    .pipe(source(`${meta.name}.js`, paths.src))

    // buffer the output
    .pipe(buffer())

    // init sourcemaps with inline sourcemap produced by rollup-stream
    .pipe(sourcemaps.init({
      loadMaps: true
    }))

    // minify code
    .pipe(uglify())

    // append header
    .pipe(header(distHeader))

  // create polyfill stream from existing files
  let polyfillStream = gulp.src([
    './node_modules/dom4/build/dom4.js',
    './node_modules/babel-polyfill/dist/polyfill.min.js'
  ], { base: '.' })
    .pipe(sourcemaps.init())

  // compose library bundle
  let libraryBundleStream = appStream.pipe(clone())
    // render sourcemaps
    .pipe(sourcemaps.write('.'))

  // compose browser bundle
  let browserBundleStream = mergeStream(polyfillStream, appStream)
    // concat polyfill and library
    .pipe(concat(`${meta.name}-browser.js`))
    // render sourcemaps
    .pipe(sourcemaps.write('.'))

  // save bundles and sourcemaps
  return mergeStream(libraryBundleStream, browserBundleStream)
    .pipe(gulp.dest(paths.scriptDist))
})

gulp.task('style', ['clean-style'], () => {
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

gulp.task('clean-style', () => {
  return del([paths.styleDist])
})

gulp.task('clean-script', () => {
  return del([paths.scriptDist])
})

gulp.task('clean-doc', () => {
  return del([paths.doc])
})

gulp.task('watch', () => {
  // watch scripts and tests
  gulp.watch(
    [paths.script + '/**/*.js', paths.test + '/**/*.js'],
    ['test', 'script'])
  // watch styles
  gulp.watch(
    paths.style + '/**/*.scss',
    ['style'])
})

gulp.task('build', ['script', 'style', 'doc'])
gulp.task('default', ['test', 'script', 'style', 'watch'])
