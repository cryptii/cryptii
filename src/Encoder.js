
import Brick from './Brick'
import Chain from './Chain'
import EncoderView from './View/Encoder'
import InvalidInputError from './Error/InvalidInput'
import MathUtil from './MathUtil'

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
    this._encodeOnly = false
    this._lastError = null
    this._lastTranslationMeta = null
  }

  /**
   * Prepares and performs encode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Encoded content
   */
  encode (content) {
    return this.translate(content, true)
  }

  /**
   * Prepares and performs decode on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @return {Promise} Decoded content
   */
  decode (content) {
    return this.translate(content, false)
  }

  /**
   * Prepares and performs translation on given content.
   * @param {number[]|string|Uint8Array|Chain} content
   * @param {boolean} isEncode True for encode, false for decode
   * @return {Promise} Resulting content
   */
  translate (content, isEncode) {
    // track translation start time
    const startTime = MathUtil.time()

    return new Promise(resolve => {
      // wrap content in Chain
      content = Chain.wrap(content)

      // check for encode only
      if (isEncode === this._reverse && this.isEncodeOnly()) {
        throw new InvalidInputError(
          `Decoding step is not defined for '${this.getMeta().title}'`)
      }

      // check for invalid settings
      const invalidSettings = this.getInvalidSettings()
      if (invalidSettings.length > 0) {
        throw new InvalidInputError(
          `Can't ${isEncode ? 'encode' : 'decode'} with invalid settings: ` +
          invalidSettings.map(setting => setting.getLabel()).join(', '))
      }

      // perform actual translation
      if (isEncode !== this._reverse) {
        // perform encode
        resolve(Promise.resolve(this.willEncode(content))
          .then(this.performEncode.bind(this))
          .then(this.didEncode.bind(this)))
      } else {
        // perform decode
        resolve(Promise.resolve(this.willDecode(content))
          .then(this.performDecode.bind(this))
          .then(this.didDecode.bind(this)))
      }
    })

      // track translation meta
      .then(result => {
        this._lastError = null
        this._lastTranslationMeta = {
          isEncode,
          duration: MathUtil.time() - startTime,
          byteCount: !content.needsByteEncoding() ? content.getSize() : null,
          charCount: !content.needsTextEncoding() ? content.getLength() : null
        }
        this.updateView()
        return result
      })

      // track thrown error during translation
      .catch(error => {
        this._lastError = error
        this._lastTranslationMeta = null
        this.updateView()
        throw error
      })
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
   * Serializes Brick to a JSON serializable object.
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
}
