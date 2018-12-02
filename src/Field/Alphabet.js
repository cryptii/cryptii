
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
    this.setMinLength(2, false)
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    const result = super.validateValue(rawValue)
    if (result !== true) {
      return result
    }

    // filter value
    const value = this.filterValue(rawValue)

    // check if alphabet only contains unique characters
    // while respecting case sensitivity
    const alphabet = this.isCaseSensitive() ? value : value.toLowerCase()
    if (!ArrayUtil.isUnique(alphabet.getCodePoints())) {
      return {
        key: 'alphabetCharactersNotUnique',
        message: `The value must not contain duplicate characters`
      }
    }

    return true
  }
}
