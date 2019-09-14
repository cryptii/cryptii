
import { detect } from 'detect-browser'

/**
 * Lazily detected browser object.
 * @type {object|false}
 */
let current = null

/**
 * Utility class providing static methods for environment identification.
 */
export default class EnvUtil {
  /**
   * Identifies and returns the name and version of the current environment.
   * @return {object|false} Object with name and version or false, if unknown
   */
  static identify () {
    if (current === null) {
      current = detect() || false
    }
    return current
  }

  /**
   * Returns true, if at least one of the given identifiers match with the
   * current environment.
   *
   * Example identifiers:
   * - ie=11
   * - chrome>=70.0
   * - edge-chromium
   * - node>=10
   *
   * @param {...string} identifiers Identifiers to be matched
   * @return {boolean}
   */
  static match (...identifiers) {
    const current = EnvUtil.identify()
    if (current === false) {
      return false
    }
    const pattern = /([a-zA-Z0-9-]+)(?:([<>=]+)([0-9.]+))?/
    return undefined !== identifiers.find(identifier => {
      const [, name, constraint, version] = identifier.match(pattern)
      return name === current.name && (
        version === undefined ||
        this.matchVersion(current.version, constraint, version)
      )
    })
  }

  /**
   * Matches two semver version strings within the given constraint.
   * @param {string} v1 First version string
   * @param {string} constraint Constraint string (e.g. <, <=, =, >=, >)
   * @param {string} v2 Second version string
   * @return {number} Returns true, if the versions match.
   */
  static matchVersion (v1, constraint, v2) {
    const a = v1.split('.')
    const b = v2.split('.')
    const k = Math.min(a.length, b.length)
    let compare = '='
    let i = -1

    while (compare === '=' && ++i < k) {
      a[i] = parseInt(a[i], 10)
      b[i] = parseInt(b[i], 10)
      compare = a[i] !== b[i] ? (a[i] < b[i] ? '<' : '>') : '='
    }

    if (compare === '=') {
      compare = a.length !== b.length ? (a.length < b.length ? '<' : '>') : '='
    }

    return constraint.indexOf(compare) !== -1
  }

  /**
   * Returns true, if running in a Node.js environment.
   * @return {boolean}
   */
  static isNode () {
    return this.match('node')
  }

  /**
   * Returns true, if running in a browser environment.
   * @return {boolean}
   */
  static isBrowser () {
    return typeof window !== 'undefined'
  }

  /**
   * Places the browser identifier into the root element 'data-browser'
   * attribute to power the SASS browser mixin.
   * @return {EnvUtil}
   */
  static placeBrowserAttribute () {
    if (EnvUtil.isBrowser() && EnvUtil.identify() !== false) {
      const { name, version } = EnvUtil.identify()
      document.documentElement.dataset.browser = `${name}/${version}`
    }
    return this
  }
}
