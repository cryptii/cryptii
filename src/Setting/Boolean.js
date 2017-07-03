
import Setting from '../Setting'

const knownTrueValues = [true, 1, '1', 'true']
const knownFalseValues = [false, 0, '0', 'false']

/**
 * Boolean Setting.
 */
export default class BooleanSetting extends Setting {
  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean} True, if valid.
   */
  validateValue (rawValue) {
    return super.validateValue(rawValue) && (
      knownTrueValues.indexOf(rawValue) !== -1 ||
      knownFalseValues.indexOf(rawValue) !== -1
    )
  }

  /**
   * Filters given raw value.
   * @param {mixed} rawValue Value to be filtered.
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    return super.filterValue(knownTrueValues.indexOf(rawValue) !== -1)
  }

  /**
   * Returns a randomly chosen value.
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    return random.nextBoolean()
  }
}
