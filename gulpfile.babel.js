
import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import rollup from 'rollup-stream'
import babel from 'rollup-plugin-babel'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import rename from 'gulp-rename'
import uglify from 'gulp-uglify'
import standard from 'gulp-standard'
import mocha from 'gulp-mocha'
import esdoc from 'gulp-esdoc-stream'
import sass from 'gulp-ruby-sass'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'

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
          ['es2015', { modules: false }]
        ],
        plugins: ['external-helpers']
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
  // compile sass code to css
  return sass(paths.style + '/main.scss', {
    style: 'expanded',
    loadPath: ['node_modules']
  })
    // display errors
    .on('error', err => console.error(err.message))

    // autoprefix css
    .pipe(autoprefixer('last 2 version', 'ie 11', '> 1%'))

    // minify
    .pipe(cleanCSS({ processImport: false }))

    // save result
    .pipe(rename(meta.name + '.css'))
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
gulp.task('default', ['test', 'build', 'watch'])
