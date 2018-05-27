
import ArrayUtil from '../ArrayUtil'
import TextSetting from './Text'

/**
 * Alphabet setting allowing the selection of Unicode characters.
 */
export default class AlphabetSetting extends TextSetting {
  /**
   * Setting constructor
   * @param {string} name
   * @param {Object} [spec]
   * @param {mixed} [spec.options] Setting options
   */
  constructor (name, spec = {}) {
    super(name, spec)

    // an alphabet with less than 2 characters makes no sense
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
