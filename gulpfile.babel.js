
import autoprefixer from 'gulp-autoprefixer'
import babel from 'rollup-plugin-babel'
import buffer from 'vinyl-buffer'
import cleanCSS from 'gulp-clean-css'
import commonJs from 'rollup-plugin-commonjs'
import esdoc from 'gulp-esdoc-stream'
import gulp from 'gulp'
import mocha from 'gulp-mocha'
import nodeResolve from 'rollup-plugin-node-resolve'
import rename from 'gulp-rename'
import rollup from 'rollup-stream'
import sass from 'gulp-sass'
import sassSVGInliner from 'sass-inline-svg'
import source from 'vinyl-source-stream'
import sourcemaps from 'gulp-sourcemaps'
import standard from 'gulp-standard'
import uglify from 'gulp-uglify'

let meta = require('./package.json')

let paths = {
  script: './src',
  scriptDist: './dist/script',
  style: './style',
  styleDist: './dist/style',
  test: './test',
  doc: './docs',
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

gulp.task('doc', () => {
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

gulp.task('script', ['lint-script'], () => {
  // run module builder and return a stream
  const stream = rollup({
    entry: paths.script + '/index.js',
    external: [
    ],
    plugins: [
      babel({
        babelrc: false,
        presets: [
          ['es2015', {
            loose: true,
            modules: false
          }]
        ],
        plugins: ['external-helpers'],
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
    moduleName: meta.moduleName,
    sourceMap: true,
    cache: rollupCache,
    amd: { id: meta.name }
  })

  return stream
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
    .pipe(source(meta.name + '.js', paths.src))

    // buffer the output, most gulp plugins do not support streams
    .pipe(buffer())

    // init sourcemaps with inline sourcemap produced by rollup-stream
    .pipe(sourcemaps.init({
      loadMaps: true
    }))

    // minify code
    .pipe(uglify())

    // save result
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scriptDist))
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
          'inline-svg': sassSVGInliner(paths.assetsSVG)
        }
      })
        .on('error', sass.logError)
    )

    // autoprefix css
    .pipe(autoprefixer('last 2 version', 'ie 11', '> 1%'))

    // minify
    .pipe(cleanCSS({ processImport: false }))

    // save result
    .pipe(rename(meta.name + '.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styleDist))
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
