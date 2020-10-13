
const { src, dest, parallel, series, watch } = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('rollup-plugin-babel')
const cleanCSS = require('gulp-clean-css')
const commonJs = require('rollup-plugin-commonjs')
const del = require('del')
const header = require('gulp-header')
const mocha = require('gulp-mocha')
const nodeResolve = require('rollup-plugin-node-resolve')
const rename = require('gulp-rename')
const revision = require('git-rev-sync')
const rollup = require('gulp-better-rollup')
const rollupReplace = require('@rollup/plugin-replace')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const standard = require('gulp-standard')
const terser = require('gulp-terser')

const meta = require('./package.json')
const paths = {
  assets: './assets',
  script: './src',
  scriptDist: './dist/script',
  style: './style',
  styleDist: './dist/style',
  test: './test'
}

function composeVersion () {
  try {
    // Include branch and commit as build metadata
    const branch = revision.branch().replace(/[^0-9A-Za-z-]+/g, '-')
    return `${meta.version}+${branch}.${revision.short()}`
  } catch (err) {
    // Git revision details not available, only return package version
    return meta.version
  }
}

/**
 * Injects a dist header featuring the package name, version and copyright
 * notice into every file in the pipe.
 * @return {function}
 */
function injectDistHeader () {
  const version = `v${composeVersion()}`
  const year = new Date().getFullYear()
  return header(`/*! ${meta.name} ${version} - (c) ${meta.author} ${year} */\n`)
}

/**
 * Renames all files in the pipe such that `index` gets replaced
 * by the package name.
 * @return {function}
 */
function renameIndexToPackage() {
  return rename(path => {
    path.basename = path.basename.replace('index', meta.name)
  })
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
        '@babel/register'
      ]
    }))
}

function scriptLint () {
  return src(paths.script + '/index*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
}

function script () {
  return src(paths.script + '/index*.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      external: ['crypto'],
      plugins: [
        rollupReplace({
          CRYPTII_VERSION: JSON.stringify(composeVersion())
        }),
        babel({
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
              }
            ]
          ],
          plugins: ['inline-svg'],
          exclude: ['node_modules/**']
        }),
        nodeResolve({
          mainFields: ['module', 'main']
        }),
        commonJs({
          include: ['node_modules/**'],
          ignore: ['os']
        })
      ],
      onwarn: warning => {
        // Skip certain warnings
        // See https://stackoverflow.com/questions/43556940/
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return
        }

        // Warn about everything else
        console.warn(warning.message)
      }
    }, {
      format: 'umd',
      strict: false,
      name: meta.name,
      globals: {
        crypto: 'crypto'
      }
    }))
    .pipe(terser())
    .pipe(renameIndexToPackage())
    .pipe(injectDistHeader())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scriptDist))
}

function styleClean () {
  return del([paths.styleDist])
}

function style () {
  return src(paths.style + '/index*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ['node_modules'],
        outputStyle: 'expanded'
      })
        .on('error', sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(renameIndexToPackage())
    .pipe(injectDistHeader())
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
