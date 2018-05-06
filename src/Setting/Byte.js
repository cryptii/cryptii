
import ByteSettingView from '../View/Setting/Byte'
import Setting from '../Setting'

/**
 * Byte Setting.
 */
export default class ByteSetting extends Setting {
  /**
   * Setting constructor.
   * @param {string} name
   * @param {Object} [spec]
   * @param {mixed} [spec.options] Setting options
   * @param {?number} [spec.options.minSize=null] Minimum size in bytes
   * @param {?number} [spec.options.maxSize=null] Maximum size in bytes
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = ByteSettingView

    this._value = spec.value || new Uint8Array()
    this._minSize = null
    this._maxSize = null

    const options = spec.options || {}
    this.setMinSize(options.minSize || null, false)
    this.setMaxSize(options.maxSize || null, false)
  }

  /**
   * Returns min size in bytes.
   * @return {number}
   */
  getMinSize () {
    return this._minSize
  }

  /**
   * Sets min size in bytes.
   * @param {?number} minSize Minimum size in bytes
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {ByteSetting} Fluent interface
   */
  setMinSize (minSize, revalidate = true) {
    if (this._minSize === minSize) {
      return this
    }
    this._minSize = minSize !== null ? parseInt(minSize) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns max size in bytes.
   * @return {number}
   */
  getMaxSize () {
    return this._maxSize
  }

  /**
   * Sets max size in bytes.
   * @param {?number} maxSize Maximum size in bytes
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @return {ByteSetting} Fluent interface
   */
  setMaxSize (maxSize, revalidate = true) {
    if (this._maxSize === maxSize) {
      return this
    }
    this._maxSize = maxSize !== null ? parseInt(maxSize) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid.
   */
  validateValue (rawValue) {
    if (!(rawValue instanceof Uint8Array)) {
      return {
        key: 'byteUnexpectedType',
        message: 'The value is expected to be of type Uint8Array'
      }
    }

    // validate min size
    if (this._minSize !== null && rawValue.length < this._minSize) {
      return {
        key: 'byteSizeTooShort',
        message:
          `The value is less than ${this._minSize} ` +
          `${this._minSize === 1 ? 'byte' : 'bytes'} long`
      }
    }

    // validate max size
    if (this._maxSize !== null && rawValue.length > this._maxSize) {
      return {
        key: 'byteSizeTooLong',
        message:
          `The value is more than ${this._maxSize} ` +
          `${this._maxSize === 1 ? 'byte' : 'bytes'} long`
      }
    }

    return super.validateValue(rawValue)
  }

  /**
   * Returns a randomly chosen value or null if not applicable.
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    const value = super.randomizeValue(random)
    if (value !== null) {
      return value
    }
    if (this.isValid()) {
      // use the current value's size to
      // produce the same amount of random bytes
      return random.nextBytes(this.getValue().length)
    }
    return null
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {TextSettingView} view
   * @param {mixed} value
   * @return {TextSetting} Fluent interface
   */
  viewValueDidChange (view, value) {
    return this.setValue(value, view)
  }
}
