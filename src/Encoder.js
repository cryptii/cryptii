import Brick from './Brick.js'
import Chain from './Chain.js'
import EncoderView from './View/Encoder.js'
import EventManager from './EventManager.js'
import InvalidInputError from './Error/InvalidInput.js'
import MathUtil from './MathUtil.js'

/**
 * Abstract Brick for encoding and decoding content.
 * @abstract
 */
export default class Encoder extends Brick {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._viewPrototype = EncoderView
    this._reverse = false
    this._encodeOnly = false
    this._lastError = null
    this._lastTranslationMeta = null
  }

  /**
   * Prepares and performs encode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Resolves to encoded content
   */
  async encode (content) {
    return this.translate(content, true)
  }

  /**
   * Prepares and performs decode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Resolves to decoded content
   */
  async decode (content) {
    return this.translate(content, false)
  }

  /**
   * Prepares and performs translation on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {boolean} isEncode True for encode, false for decode
   * @return {Promise} Resolves to translation result
   */
  async translate (content, isEncode) {
    try {
      // Track translation start time
      const startTime = MathUtil.time()

      // Check if translation direction is allowed
      if (isEncode === this._reverse && this.isEncodeOnly()) {
        throw new InvalidInputError(
          `Decoding is not defined in brick '${this.getMeta().title}'`)
      }

      // Check for invalid settings
      const invalidSettings = this.getSettingsForm().getInvalidFields()
      if (invalidSettings.length > 0) {
        throw new InvalidInputError(
          `Can't ${isEncode ? 'encode' : 'decode'} with invalid settings: ` +
          invalidSettings.map(setting => setting.getLabel() + ' (' + (setting.getMessage() || 'none') + ')').join(', '))
      }

      // Wrap content in Chain
      content = Chain.wrap(content)

      // Perform translation
      if (isEncode !== this._reverse) {
        content = Chain.wrap(await this.willEncode(content))
        content = Chain.wrap(await this.performEncode(content))
        content = Chain.wrap(await this.didEncode(content))
      } else {
        content = Chain.wrap(await this.willDecode(content))
        content = Chain.wrap(await this.performDecode(content))
        content = Chain.wrap(await this.didDecode(content))
      }

      // Track successful translation
      this._lastError = null
      this._lastTranslationMeta = {
        isEncode,
        duration: MathUtil.time() - startTime,
        byteCount: !content.needsByteEncoding() ? content.getSize() : null,
        charCount: !content.needsTextEncoding() ? content.getLength() : null
      }
      this.updateView()
      return content
    } catch (error) {
      // Track failed translation
      this._lastError = error
      this._lastTranslationMeta = null
      this.updateView()
      throw error
    }
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
      this.updateView()
      this.hasPipe() && this.getPipe().encoderDidReverse(this, reverse)
    }
    return this
  }

  /**
   * Wether this encoder is encoding only.
   * @return {boolean}
   */
  isEncodeOnly () {
    return this._encodeOnly
  }

  /**
   * Sets wether this encoder is encoding only.
   * @protected
   * @param {boolean} encodeOnly
   * @return {Encoder}
   */
  setEncodeOnly (encodeOnly) {
    this._encodeOnly = encodeOnly
    return this
  }

  /**
   * Returns error occurred during last translation.
   * @return {?Error}
   */
  getLastError () {
    return this._lastError
  }

  /**
   * Returns meta object of last translation.
   * @return {?object}
   */
  getLastTranslationMeta () {
    return this._lastTranslationMeta
  }

  /**
   * Serializes brick to a JSON serializable value.
   * @return {mixed} Serialized data
   */
  serialize () {
    const object = super.serialize()
    if (this.isReverse()) {
      object.reverse = true
    }
    return object
  }

  /**
   * Creates a copy of this brick.
   * @return {Brick} Brick copy instance
   */
  copy () {
    const copy = super.copy()
    copy.setReverse(this.isReverse())
    return copy
  }

  /**
   * Triggered before performing encode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willEncode (content) {
    return this.willTranslate(content, true)
  }

  /**
   * Performs encode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    return this.performTranslate(content, true)
  }

  /**
   * Triggered after performing encode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  didEncode (content) {
    return this.didTranslate(content, true)
  }

  /**
   * Triggered before performing decode on given content.
   * Calls {@link Encoder.willTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willDecode (content) {
    return this.willTranslate(content, false)
  }

  /**
   * Performs decode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    return this.performTranslate(content, false)
  }

  /**
   * Triggered after performing decode on given content.
   * Calls {@link Encoder.didTranslate} by default.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  didDecode (content) {
    return this.didTranslate(content, false)
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willTranslate (content, isEncode) {
    return content
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    return content
  }

  /**
   * Triggered after performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  didTranslate (content, isEncode) {
    return content
  }

  /**
   * Triggered when the encoder has been reversed.
   * @param {EncoderView} view Sender
   */
  viewDidReverse (view) {
    // Reverse self
    this.setReverse(!this.isReverse())
    // Track action
    EventManager.trigger('encoderReverse', {
      encoder: this,
      reverse: this.isReverse()
    })
  }
}
