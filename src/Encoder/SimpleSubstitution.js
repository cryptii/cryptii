
import Encoder from '../Encoder'
import Chain from '../Chain'

/**
 * Abstract Encoder foundation for simple substitution ciphers.
 * @abstract
 */
export default class SimpleSubstitutionEncoder extends Encoder {
  /**
   * Performs encode on given content.
   * @param {Chain} content
   * @return {Chain|Promise}
   */
  encode (content) {
    // encode each code point
    // TODO reduce calls to encodeChar to a minimum (e.g. caching)
    let encodedCodePoints = content.getCodePoints()
      .map((codePoint, index) => this.encodeChar(codePoint, index, content))
    // create new chain from encoded code points
    return new Chain(encodedCodePoints)
  }

  /**
   * Performs encode on given character, index and content.
   * @abstract
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index inside content.
   * @param {Chain} content Content to be encoded.
   * @return {number} Encoded Unicode code point
   */
  encodeChar (codePoint, index, content) {
    // abtract method
  }

  /**
   * Performs decode on given content.
   * @param {Chain} content
   * @return {Chain|Promise}
   */
  decode (content) {
    // decode each code point
    // TODO reduce calls to decodeChar to a minimum (e.g. caching)
    let decodedCodePoints = content.getCodePoints()
      .map((codePoint, index) => this.decodeChar(codePoint, index, content))
    // create new chain from decoded code points
    return new Chain(decodedCodePoints)
  }

  /**
   * Performs decode on given character, index and content.
   * @abstract
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index inside content.
   * @param {Chain} content Content to be decoded.
   * @return {number} Decoded Unicode code point
   */
  decodeChar (codePoint, index, content) {
    // abtract method
  }
}
