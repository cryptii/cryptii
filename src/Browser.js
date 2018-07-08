
import { detect } from 'detect-browser'

let browserIdentifier = null

/**
 * Utility class providing static methods for
 * identifying browser name and version.
 */
export default class Browser {
  /**
   * Returns current browser identifier (format: [browser name]-[version]).
   * @return {string}
   */
  static getIdentifier () {
    if (browserIdentifier === null) {
      const browser = detect()
      browserIdentifier = browser ? `${browser.name}-${browser.version}` : false
    }
    return browserIdentifier
  }

  /**
   * Matches one or more browsers using name-version identifiers.
   * @param {...string} identifiers
   * @return {boolean} True, if one of the identifiers match.
   */
  static match (...identifiers) {
    const browserIdentifier = Browser.getIdentifier()
    if (browserIdentifier === false) {
      // unable to identify browser
      return false
    }

    // check if at least one of the identifiers match
    return identifiers.reduce((match, string) =>
      match || string === browserIdentifier.substr(0, string.length), false)
  }

  /**
   * Checks wether script is currently running inside a node environment.
   * @param {string} [version] Version string
   * @return {Boolean}
   */
  static isNode (version = '') {
    return this.match('node-' + version)
  }

  /**
   * Applies browser identifier class name to html tag.
   * @return {Browser} Fluent interface
   */
  static applyClassName () {
    const browserIdentifier = Browser.getIdentifier()
    if (!Browser.isNode() && browserIdentifier) {
      // add browser identifier class name to html tag
      // makes browser sass mixin work
      const $html = document.querySelector('html')
      $html.classList.add(`browser--${browserIdentifier}`)
    }
    return this
  }
}
