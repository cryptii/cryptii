
import Brick from './Brick'
import Chain from './Chain'
import EncoderView from './View/Encoder'

/**
 * Abstract Brick for encoding and decoding content.
 * @abstract
 */
export default class Encoder extends Brick {
  /**
   * Brick constructor
   */
  constructor () {
    super()
    this._viewPrototype = EncoderView
  }

  /**
   * Prepares and performs encode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Chain|Promise} Encoded content
   */
  encode (content) {
    if (!this.areSettingsValid()) {
      throw new Error(`Can't encode. At least one setting is invalid.`)
    }

    content = Chain.wrap(content)
    content = this.willEncode(content)
    let result = this.performEncode(content)

    if (result instanceof Chain) {
      return this.didEncode(result)
    } else {
      return Promise.resolve(result).then(this.didEncode.bind(this))
    }
  }

  /**
   * Triggered before performing encode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  willEncode (content) {
    return this.willTranslate(content, true)
  }

  /**
   * Performs encode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {string} content
   * @return {Chain|Promise} Encoded content
   */
  performEncode (content) {
    return this.performTranslate(content, true)
  }

  /**
   * Triggered after performing encode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  didEncode (content) {
    return this.didTranslate(content, true)
  }

  /**
   * Prepares and performs decode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Chain|Promise} Decoded content
   */
  decode (content) {
    if (!this.areSettingsValid()) {
      throw new Error(`Can't decode. At least one setting is invalid.`)
    }

    content = Chain.wrap(content)
    content = this.willDecode(content)
    let result = this.performDecode(content)

    if (result instanceof Chain) {
      return this.didDecode(result)
    } else {
      return Promise.resolve(result).then(this.didDecode.bind(this))
    }
  }

  /**
   * Triggered before performing decode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  willDecode (content) {
    return this.willTranslate(content, false)
  }

  /**
   * Performs decode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {string} content
   * @return {Chain|Promise} Decoded content
   */
  performDecode (content) {
    return this.performTranslate(content, false)
  }

  /**
   * Triggered after performing decode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  didDecode (content) {
    return this.didTranslate(content, false)
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {string} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {string} Filtered content
   */
  willTranslate (content, isEncode) {
    return content
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {string} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    return content
  }

  /**
   * Triggered after performing encode or decode on given content.
   * @protected
   * @param {string} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {string} Filtered content
   */
  didTranslate (content, isEncode) {
    return content
  }
}
