
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
    this._reverse = false
  }

  /**
   * Prepares and performs encode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Encoded content
   */
  encode (content) {
    if (!this.areSettingsValid()) {
      throw new Error(`Can't encode. At least one setting is invalid.`)
    }
    content = Chain.wrap(content)
    if (!this._reverse) {
      return Promise.resolve(this.willEncode(content))
        .then(this.performEncode.bind(this))
        .then(this.didEncode.bind(this))
    } else {
      return Promise.resolve(this.willDecode(content))
        .then(this.performDecode.bind(this))
        .then(this.didDecode.bind(this))
    }
  }

  /**
   * Triggered before performing encode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Filtered content
   */
  willEncode (content) {
    return this.willTranslate(content, true)
  }

  /**
   * Performs encode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Encoded content
   */
  performEncode (content) {
    return this.performTranslate(content, true)
  }

  /**
   * Triggered after performing encode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Filtered content
   */
  didEncode (content) {
    return this.didTranslate(content, true)
  }

  /**
   * Prepares and performs decode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Decoded content
   */
  decode (content) {
    if (!this.areSettingsValid()) {
      throw new Error(`Can't decode. At least one setting is invalid.`)
    }
    content = Chain.wrap(content)
    if (!this._reverse) {
      return Promise.resolve(this.willDecode(content))
        .then(this.performDecode.bind(this))
        .then(this.didDecode.bind(this))
    } else {
      return Promise.resolve(this.willEncode(content))
        .then(this.performEncode.bind(this))
        .then(this.didEncode.bind(this))
    }
  }

  /**
   * Triggered before performing decode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Filtered content
   */
  willDecode (content) {
    return this.willTranslate(content, false)
  }

  /**
   * Performs decode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Decoded content
   */
  performDecode (content) {
    return this.performTranslate(content, false)
  }

  /**
   * Triggered after performing decode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Filtered content
   */
  didDecode (content) {
    return this.didTranslate(content, false)
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Filtered content
   */
  willTranslate (content, isEncode) {
    return content
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    return content
  }

  /**
   * Triggered after performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Filtered content
   */
  didTranslate (content, isEncode) {
    return content
  }

  /**
   * Wether to reverse translation.
   * @return {boolean}
   */
  isReverse () {
    return this._reverse
  }

  /**
   * Sets wether to reverse translation.
   * @param {boolean} reverse
   * @return {Encoder} Fluent interface
   */
  setReverse (reverse) {
    if (this._reverse !== reverse) {
      this._reverse = reverse
      this.hasView() && this.getView().update()
      this.hasPipe() && this.getPipe().encoderDidReverse(this, reverse)
    }
    return this
  }
}
