
import TextSetting from './Text'
import ArrayUtil from '../ArrayUtil'

/**
 * Alphabet Setting allowing the selection of Unicode characters.
 */
export default class AlphabetSetting extends TextSetting {
  /**
   * Setting constructor.
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
   * @return {boolean} True, if valid.
   */
  validateValue (rawValue) {
    let valid = super.validateValue(rawValue)
    if (!valid) {
      return false
    }

    // filter value
    let value = this.filterValue(rawValue)

    // check if alphabet only contains unique characters
    // while respecting case sensitivity
    let alphabet = this.isCaseSensitive() ? value : value.toLowerCase()
    return ArrayUtil.isUnique(alphabet.getCodePoints())
  }
}
