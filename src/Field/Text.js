
import ArrayUtil from '../ArrayUtil'
import Chain from '../Chain'
import Field from '../Field'
import TextEncoder from '../TextEncoder'
import TextFieldView from '../View/Field/Text'

/**
 * Text field
 */
export default class TextField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {object} [spec] Field spec
   * @param {mixed} [spec.options] Field options
   * @param {?number} [spec.options.minLength=null] Minimum amount of characters
   * @param {?number} [spec.options.maxLength=null] Maximum amount of characters
   * @param {?number[]} [spec.options.allowedCodePoints=null]
   * Restricts text to given Unicode code points.
   * @param {boolean} [spec.options.caseSensitivity=false]
   * Wether to respect case sensitivity
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = TextFieldView

    this._value = Chain.wrap(spec.value || null)
    this._minLength = null
    this._maxLength = null
    this._allowedChars = null
    this._caseSensitivity = null

    const options = spec.options || {}
    this.setMinLength(
      options.minLength !== undefined ? options.minLength : null, false)
    this.setMaxLength(
      options.maxLength !== undefined ? options.maxLength : null, false)

    this.setAllowedChars(options.allowedChars || null, false)
    this.setCaseSensitivity(options.caseSensitivity || false, false)
  }

  /**
   * Returns min text length.
   * @return {number}
   */
  getMinLength () {
    return this._minLength
  }

  /**
   * Sets min text length.
   * @param {?number} minLength Min text length
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setMinLength (minLength, revalidate = true) {
    if (this._minLength === minLength) {
      return this
    }
    this._minLength = minLength !== null ? parseInt(minLength) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns max text length.
   * @return {?number}
   */
  getMaxLength () {
    return this._maxLength
  }

  /**
   * Sets max text length.
   * @param {?number} maxLength Max text length
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setMaxLength (maxLength, revalidate = true) {
    if (this._maxLength === maxLength) {
      return this
    }
    this._maxLength = maxLength !== null ? parseInt(maxLength) : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns allowed Unicode code points.
   * @return {?number[]} Allowed Unicode code points
   */
  getAllowedChars () {
    return this._allowedChars
  }

  /**
   * Restricts text to given Unicode code points.
   * @param {?number[]|string|Chain} allowedChars
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setAllowedChars (allowedChars, revalidate = true) {
    if (this._allowedChars === allowedChars) {
      return this
    }

    if (typeof allowedChars === 'string') {
      allowedChars = TextEncoder.codePointsFromString(allowedChars)
    } else if (allowedChars instanceof Chain) {
      allowedChars = allowedChars.getCodePoints()
    }

    this._allowedChars = allowedChars
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns wether to respect case sensitivity.
   * @return {boolean}
   */
  isCaseSensitive () {
    return this._caseSensitivity
  }

  /**
   * Sets wether to respect case sensitivity.
   * @param {boolean} caseSensitivity
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setCaseSensitivity (caseSensitivity, revalidate = true) {
    if (this._caseSensitivity === caseSensitivity) {
      return this
    }
    this._caseSensitivity = caseSensitivity
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    if (typeof rawValue.toString !== 'function') {
      return {
        key: 'textInvalidString',
        message: `The value can't be casted to a string`
      }
    }

    const value = this.filterValue(rawValue)

    // Validate min text length
    if (this._minLength !== null && value.getLength() < this._minLength) {
      return {
        key: 'textLengthTooShort',
        message:
          `The value must be at least ${this._minLength} ` +
          `${this._minLength === 1 ? 'character' : 'characters'} long`
      }
    }

    // Validate max text length
    if (this._maxLength !== null && value.getLength() > this._maxLength) {
      return {
        key: 'textLengthTooLong',
        message:
          `The value must not exceed ${this._maxLength} ` +
          `${this._maxLength === 1 ? 'character' : 'characters'} in length`
      }
    }

    // Validate allowed chars
    if (this._allowedChars !== null) {
      let invalidCharacters = []
      for (let i = 0; i < value.getLength(); i++) {
        if (this._allowedChars.indexOf(value.getCodePointAt(i)) === -1) {
          invalidCharacters.push(value.getCharAt(i))
        }
      }

      if (invalidCharacters.length > 0) {
        invalidCharacters = ArrayUtil.unique(invalidCharacters)
        return {
          key: 'textNotAllowedCharacter',
          message:
            `The value contains characters that are not allowed: ` +
            `'${invalidCharacters.join('')}'`
        }
      }
    }

    return super.validateValue(value)
  }

  /**
   * Filters given raw value.
   * @param {mixed} rawValue Value to be filtered.
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    rawValue = Chain.wrap(rawValue)
    if (this._caseSensitivity === false) {
      rawValue = rawValue.toLowerCase()
    }
    return Chain.wrap(super.filterValue(rawValue))
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
    if (this.isValid() && this.getAllowedChars() !== null) {
      // Use the current value's length to
      // produce the same amount of random chars
      const length = this.getValue().getLength()
      const codePoints = []
      for (let i = 0; i < length; i++) {
        codePoints.push(random.nextChoice(this.getAllowedChars()))
      }
      return Chain.wrap(codePoints)
    }
    return null
  }

  /**
   * Serializes the value to a JSON serializable object.
   * @throws {Error} If serialization is not possible.
   * @return {mixed} Serialized data
   */
  serializeValue () {
    return this.getValue().getString()
  }

  /**
   * Extracts a value serialized by {@link Field.serializeValue} and returns it.
   * @param {mixed} data Serialized data
   * @return {mixed} Extracted value
   */
  extractValue (data) {
    if (typeof data !== 'string') {
      throw new Error(
        `Value of field '${this.getName()}' is expected to be a string.`)
    }
    return Chain.wrap(data)
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {TextFieldView} view
   * @param {mixed} value
   * @return {TextField} Fluent interface
   */
  viewValueDidChange (view, value) {
    return this.setValue(value, view)
  }
}
