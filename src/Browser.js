
import { detect } from 'detect-browser'

const browser = detect()

/**
 * Utility class providing static methods for
 * identifying browser name and version.
 */
export default class Browser {
  /**
   * Returns the current browser's name or null if it can't be recognized.
   * @return {?string}
   */
  static getName () {
    return browser ? browser.name : null
  }

  /**
   * Returns the current browser's version or null if it can't be recognized.
   * @return {?string}
   */
  static getVersion () {
    return browser ? browser.version : null
  }

  /**
   * Matches browser name and version.
   * @param {string} name
   * @param {string|number} version
   * @return {boolean} True, if browser name and version match.
   */
  static match (name, version = '') {
    if (Browser.getName()) {
      version = version + ''
      return Browser.getName() === name && (
        version === null ||
        version === Browser.getVersion().substr(0, version.length)
      )
    }
    return false
  }

  /**
   * Applies class name to html tag.
   * @return {Browser} Fluent interface
   */
  static applyClassName () {
    if (Browser.getName()) {
      // add browser class name to html tag
      // makes browser sass mixin work
      const $html = document.querySelector('html')
      const name = Browser.getName()
      const version = Browser.getVersion()
      $html.classList.add(`browser--${name}-${version}`)
    }
    return this
  }
}
