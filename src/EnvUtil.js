/**
 * Utility class providing static methods for environment identification.
 */
export default class EnvUtil {
  /**
   * Returns true, if running in a Node.js environment.
   * @return {boolean}
   */
  static isNode () {
    return !this.isBrowser()
  }

  /**
   * Returns true, if running in a browser environment.
   * @return {boolean}
   */
  static isBrowser () {
    return typeof window !== 'undefined'
  }
}
