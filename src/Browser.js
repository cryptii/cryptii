
import { detect } from 'detect-browser'

/**
 * Lazily detected browser identifier.
 * @type {string|false}
 */
let identifier = null

/**
 * Utility class providing static methods for
 * identifying browser name and version.
 */
export default class Browser {
  /**
   * Returns the current browser's identifier formatted name-major-minor-patch.
   * @return {string|false} Browser identifier string or false, if unknown
   */
  static identify () {
    if (identifier === null) {
      const browser = detect()
      identifier = browser
        ? `${browser.name}-${browser.version.replace(/\./g, '-')}`
        : false
    }
    return identifier
  }

  /**
   * Returns true, if at least one of the given browser identifiers match with
   * the current environment (e.g. ie, safari-12-1).
   * @param {...string} browsers Browser identifiers to be matched
   * @return {boolean}
   */
  static match (...browsers) {
    const identifier = Browser.identify()
    if (identifier === false) {
      return false
    }
    return browsers.find(id => identifier.indexOf(id) === 0) !== undefined
  }

  /**
   * Checks wether script is currently running inside a Node.js environment.
   * @param {string} [version] Node.js version string
   * @return {boolean}
   */
  static isNode (version = '') {
    return this.match('node-' + version)
  }

  /**
   * Places the current browser identifier into the root element 'data-browser'
   * attribute to power the SASS browser mixin.
   * @return {Browser}
   */
  static placeBrowserAttribute () {
    if (Browser.identify() !== false && !Browser.isNode()) {
      document.documentElement.dataset.browser = Browser.identify()
    }
    return this
  }
}
