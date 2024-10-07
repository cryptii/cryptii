import ByteEncoder from '../ByteEncoder.js'
import ByteFieldView from '../View/Field/Byte.js'
import Field from '../Field.js'

/**
 * Byte setting
 */
export default class ByteField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {Object} [spec] Field spec
   * @param {?number} [spec.minSize=null] Minimum size in bytes
   * @param {?number} [spec.maxSize=null] Maximum size in bytes
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = ByteFieldView

    this._value = spec.value || new Uint8Array()
    this._minSize = null
    this._maxSize = null
    this._randomizeSize = spec.randomizeSize || null

    this.setMinSize(spec.minSize || null, false)
    this.setMaxSize(spec.maxSize || null, false)
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
   * @return {ByteField} Fluent interface
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
   * @return {ByteField} Fluent interface
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
    // Validate type
    if (!(rawValue instanceof Uint8Array)) {
      return {
        key: 'byteUnexpectedType',
        message: 'The value is expected to be of type Uint8Array'
      }
    }

    // Validate min size
    if (this._minSize !== null && rawValue.length < this._minSize) {
      return {
        key: 'byteSizeTooShort',
        message:
          `The value must be at least ${this._minSize} ` +
          `${this._minSize === 1 ? 'byte' : 'bytes'} long, ` +
          `found ${rawValue.length} ${rawValue.length === 1 ? 'byte' : 'bytes'}`
      }
    }

    // Validate max size
    if (this._maxSize !== null && rawValue.length > this._maxSize) {
      return {
        key: 'byteSizeTooLong',
        message:
          `The value must not exceed ${this._maxSize} ` +
          `${this._maxSize === 1 ? 'byte' : 'bytes'} in length, ` +
          `found ${rawValue.length} ${rawValue.length === 1 ? 'byte' : 'bytes'}`
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
    if (this._randomizeSize !== null) {
      // Use randomize size
      return random.nextBytes(this._randomizeSize)
    } else if (this.getMinSize() !== null) {
      // Use the min size
      return random.nextBytes(this.getMinSize())
    } else if (this.isValid()) {
      // Use the current value's size to
      // produce the same amount of random bytes
      return random.nextBytes(this.getValue().length)
    }
    return null
  }

  /**
   * Serializes the field value to a JSON serializable value.
   * @override
   * @throws {Error} If field value is invalid.
   * @throws {Error} If serialization is not possible.
   * @return {mixed} Serialized data
   */
  serializeValue () {
    return ByteEncoder.base64StringFromBytes(this.getValue())
  }

  /**
   * Extracts a value serialized by {@link Field.serializeValue} and returns it.
   * @param {mixed} data Serialized data
   * @return {mixed} Extracted value
   */
  extractValue (data) {
    if (typeof data !== 'string') {
      throw new Error(
        `Value of field '${this.getName()}' is expected to be a valid ` +
        'base64 string.')
    }
    return ByteEncoder.bytesFromBase64String(data)
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {TextFieldView} view
   * @param {mixed} value
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }
}
