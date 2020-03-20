
/**
 * Utility class providing static methods for common string operations.
 */
export default class StringUtil {
  /**
   * Unique id iterator
   */
  private static _iterator: number = 0

  /**
   * Translates camel case to regular string.
   * See: {@link https://stackoverflow.com/a/6229124/490161}
   *
   * @example
   * ```ts
   * const a = StringUtil.camelCaseToRegular('helloWorld')
   * // Returns 'Hello World'
   * const b = StringUtil.camelCaseToRegular('ILoveYOU')
   * // Returns 'I Love YOU'
   * ```
   *
   * @param string
   * @returns camelCased string
   */
  static camelCaseToRegular (string: string): string {
    return string
      // Insert a space between lower case & upper case characters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Space before last upper case in a sequence followed by lower case
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // Uppercase the first character
      .replace(/^./, first => first.toUpperCase())
  }

  /**
   * Returns unique identifier for current session.
   * @returns Unique identifier
   */
  static uniqueId (): string {
    return 'u' + (++StringUtil._iterator).toString(16)
  }

  /**
   * Separates string into chunks of given length.
   * @param string - String to be separated
   * @param length - Chunk length
   * @returns Array of string chunks
   */
  static chunk (string: string, length: number): string[] {
    return string !== '' ? string.match(new RegExp(`.{1,${length}}`, 'g'))! : []
  }

  /**
   * Returns true, if the given string contains a whitespace at the given index.
   * @param string - String to be tested
   * @param index - Whitespace index
   * @returns True, if the given string contains a whitespace
   */
  static isWhitespace (string: string, index: number = 0): boolean {
    return string[index] ? string[index].match(/\s/) !== null : false
  }

  /**
   * Replaces Unicode whitespace characters with given replacement.
   * @param string - Haystack
   * @param replacement - Replacement string
   * @param reduceToSingle - Wether to replace multiple successive space
   * characters with a single one
   * @returns String with replacements made to it
   */
  static replaceWhitespace (
    string: string,
    replacement: string,
    reduceToSingle:boolean = false
  ): string {
    return string.replace(reduceToSingle ? /\s+/g : /\s/g, replacement)
  }
}
