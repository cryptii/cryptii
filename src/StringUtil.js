
let iterator = 0

/**
 * Utility class providing static methods for common string operations.
 */
export default class StringUtil {
  /**
   * Translates camel case to regular string.
   * @see https://stackoverflow.com/a/6229124/490161
   * @example
   * let a = StringUtil.camelCaseToRegular('helloWorld')
   * // returns 'Hello World'
   * let b = StringUtil.camelCaseToRegular('ILoveYOU')
   * // returns 'I Love YOU'
   * @param {string} string
   * @return {string}
   */
  static camelCaseToRegular (string) {
    return string
      // insert a space between lower case & upper case characters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper case in a sequence followed by lower case
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, first => first.toUpperCase())
  }

  /**
   * Returns unique identifier for current session.
   * @return {string}
   */
  static uniqueId () {
    let uid = new Date().getTime() + (++iterator)
    return uid.toString(16)
  }
}
