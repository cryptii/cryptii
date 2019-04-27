
import ArrayUtil from '../ArrayUtil'
import TextField from './Text'

/**
 * Alphabet field allowing the selection of Unicode characters.
 */
export default class AlphabetField extends TextField {
  /**
   * Constructor
   * @param {string} name
   * @param {object} [spec]
   * @param {mixed} [spec.options] Field options
   */
  constructor (name, spec = {}) {
    super(name, spec)
    if (this.getMinLength() === null) {
      this.setMinLength(2, false)
    }
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    // Filter value before validating it
    const value = this.filterValue(rawValue)

    // Check if alphabet only contains unique characters
    if (!ArrayUtil.isUnique(value.getCodePoints())) {
      return {
        key: 'alphabetCharactersNotUnique',
        message: `The value must not contain duplicate characters`
      }
    }

    return super.validateValue(rawValue)
  }
}
