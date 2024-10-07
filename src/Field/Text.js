import ArrayUtil from '../ArrayUtil.js'
import Chain from '../Chain.js'
import Field from '../Field.js'
import TextFieldView from '../View/Field/Text.js'

/**
 * Text field
 */
export default class TextField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {object} [spec] Field spec
   * @param {?number} [spec.minLength=null] Minimum amount of characters
   * @param {?number} [spec.maxLength=null] Maximum amount of characters
   * @param {?number[]|string|Chain} [spec.whitelistChars=null]
   * Restricts the value to the given set of Unicode code points.
   * @param {?number[]|string|Chain} [spec.blacklistChars=null]
   * Forbids the given set of Unicode code points in the value.
   * @param {boolean} [spec.uniqueChars=false]
   * Sets wether value characters need to be unique.
   * @param {boolean} [spec.caseSensitivity=true]
   * Wether to respect case sensitivity
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = TextFieldView

    this._value = Chain.wrap(spec.value || null)
    this._minLength = null
    this._maxLength = null
    this._whitelistChars = null
    this._blacklistChars = null
    this._uniqueChars = false
    this._caseSensitivity = null

    // Apply field options
    this.setMinLength(spec.minLength !== undefined ? spec.minLength : null, false)
    this.setMaxLength(spec.maxLength !== undefined ? spec.maxLength : null, false)
    this.setWhitelistChars(spec.whitelistChars || null, false)
    this.setBlacklistChars(spec.blacklistChars || null, false)
    this.setUniqueChars(spec.uniqueChars || false, false)
    this.setCaseSensitivity(spec.caseSensitivity !== false, false)
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
   * Returns the whitelisted Unicode code points.
   * @return {?number[]} Whitelisted Unicode code points
   */
  getWhitelistChars () {
    return this._whitelistChars
  }

  /**
   * Restricts the value to the given set of Unicode code points.
   * @param {?number[]|string|Chain} whitelistChars Whitelist code points
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setWhitelistChars (whitelistChars, revalidate = true) {
    this._whitelistChars =
      whitelistChars !== null
        ? Chain.wrap(whitelistChars).getCodePoints()
        : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Returns the blacklisted Unicode code points.
   * @return {?number[]} Blacklisted Unicode code points
   */
  getBlacklistChars () {
    return this._blacklistChars
  }

  /**
   * Forbids the given set of Unicode code points in the value.
   * @param {?number[]|string|Chain} blacklistChars Blacklist code points
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setBlacklistChars (blacklistChars, revalidate = true) {
    this._blacklistChars =
      blacklistChars !== null
        ? Chain.wrap(blacklistChars).getCodePoints()
        : null
    return revalidate ? this.revalidateValue() : this
  }

  /**
   * Wether value characters need to be unique.
   * @return {boolean}
   */
  isUniqueChars () {
    return this._uniqueChars
  }

  /**
   * Sets wether value characters need to be unique.
   * @param {boolean} uniqueChars Character uniqueness
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @return {TextField} Fluent interface
   */
  setUniqueChars (uniqueChars, revalidate = true) {
    if (this._uniqueChars === uniqueChars) {
      return this
    }
    this._uniqueChars = uniqueChars
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
        message: 'The value can\'t be casted to a string'
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

    // Validate character uniqueness
    if (this._uniqueChars && !ArrayUtil.isUnique(value.getCodePoints())) {
      return {
        key: 'textCharactersNotUnique',
        message: 'The value must not contain duplicate characters'
      }
    }

    // Validate character whitelist and blacklist
    if (this._whitelistChars !== null || this._blacklistChars !== null) {
      const whitelist = this._whitelistChars
      const blacklist = this._blacklistChars
      let invalidChars = []
      let c

      for (let i = 0; i < value.getLength(); i++) {
        c = value.getCodePointAt(i)
        if ((whitelist !== null && whitelist.indexOf(c) === -1) ||
            (blacklist !== null && blacklist.indexOf(c) !== -1)) {
          invalidChars.push(value.getCharAt(i))
        }
      }

      if (invalidChars.length > 0) {
        invalidChars = ArrayUtil.unique(invalidChars)
        return {
          key: 'textForbiddenCharacter',
          message:
            'The value contains forbidden characters: ' +
            `'${invalidChars.join('')}'`
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
    if (this.isValid()) {
      if (this.isUniqueChars()) {
        // Shuffle the characters of the current value
        const codePoints = this.getValue().getCodePoints()
        return Chain.wrap(ArrayUtil.shuffle(codePoints, random))
      } else if (this.getWhitelistChars() !== null) {
        // Use the current value's length to
        // produce the same amount of random chars
        const length = this.getValue().getLength()
        const codePoints = []
        for (let i = 0; i < length; i++) {
          codePoints.push(random.nextChoice(this.getWhitelistChars()))
        }
        return Chain.wrap(codePoints)
      }
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
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }
}
