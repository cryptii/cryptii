
import Chain from '../Chain'
import Encoder from '../Encoder'

/**
 * Abstract encoder foundation for simple substitution ciphers
 * @abstract
 */
export default class SimpleSubstitutionEncoder extends Encoder {
  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise}
   */
  performTranslate (content, isEncode) {
    // encode or decode each code point
    // TODO reduce calls to performCharEncode or performCharDecode
    // to a minimum (e.g. caching)
    const resultingCodePoints =
      content.getCodePoints().map((codePoint, index) =>
        isEncode
          ? this.performCharEncode(codePoint, index, content)
          : this.performCharDecode(codePoint, index, content))

    // create new chain from resulting code points
    return Chain.wrap(resultingCodePoints)
  }

  /**
   * Performs encode on given character, index and content.
   * Calls {@link SimpleSubstitutionEncoder.performCharTranslate} by default.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be encoded
   * @return {number} Encoded Unicode code point
   */
  performCharEncode (codePoint, index, content) {
    return this.performCharTranslate(codePoint, index, content, true)
  }

  /**
   * Performs decode on given character, index and content.
   * Calls {@link SimpleSubstitutionEncoder.performCharTranslate} by default.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be decoded
   * @return {number} Decoded Unicode code point
   */
  performCharDecode (codePoint, index, content) {
    return this.performCharTranslate(codePoint, index, content, false)
  }

  /**
   * Performs encode or decode on given character, index and content.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be translated
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number} Resulting Unicode code point
   */
  performCharTranslate (codePoint, index, content, isEncode) {
    return codePoint
  }
}
