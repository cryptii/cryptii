
import Setting from '../Setting'

/**
 * Number Setting.
 */
export default class NumberSetting extends Setting {
  /**
   * Setting constructor.
   * @param {string} name
   * @param {Object} spec
   * @param {mixed} [spec.options] Setting options
   * @param {boolean} [spec.options.integer=false] Wether to use integer values.
   * @param {?number} [spec.options.min=null] Minimum value (inclusive)
   * @param {?number} [spec.options.max=null] Maximum value (exclusive)
   */
  constructor (name, spec) {
    super(name, spec)

    const options = spec.options || {}
    this._integer = options.integer || false
    this._min = options.min || null
    this._max = options.max || null
  }

  /**
   * Returns wether to use integer values.
   * @return {boolean}
   */
  isInteger () {
    return this._integer
  }

  /**
   * Sets wether to use integer values.
   * @param {boolean} integer
   * @return {NumberSetting} Fluent interface
   */
  setInteger (integer) {
    this._integer = integer
    return this.revalidateValue()
  }

  /**
   * Returns minimum value (inclusive).
   * @return Minimum value
   */
  getMin () {
    return this._min
  }

  /**
   * Sets minimum value (inclusive).
   * @param {number} min Minimum value
   * @return {NumberSetting} Fluent interface
   */
  setMin (min) {
    this._min = min
    return this
  }

  /**
   * Returns maximum value (exclusive).
   * @return Maximum value
   */
  getMax () {
    return this._max
  }

  /**
   * Sets maximum value (exclusive).
   * @param {number} max Maximum value
   * @return {NumberSetting} Fluent interface
   */
  setMax (max) {
    this._max = max
    return this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean} True, if valid.
   */
  validateValue (rawValue) {
    let value = this.filterValue(rawValue)

    // is numeric
    if (isNaN(value) || !isFinite(value)) {
      return false
    }

    // validate min value
    if (this._minValue !== null && value < this._minValue) {
      return false
    }

    // validate max value
    if (this._maxValue !== null && value >= this._maxValue) {
      return false
    }

    return super.validateValue(value)
  }

  /**
   * Filters given raw value.
   * @param {mixed} rawValue Value to be filtered.
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    if (this.isInteger()) {
      rawValue = parseInt(rawValue)
    } else {
      rawValue = parseFloat(rawValue)
    }
    return super.filterValue(rawValue)
  }

  /**
   * Returns a randomly chosen value.
   * @param {Random} random Random number generator
   * @throws Throws an error if random number without range is requested.
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    if (this.getMin() === null || this.getMax() === null) {
      throw new Error(`Can't randomize numeric value without min, max range.`)
    }
    if (this.isInteger()) {
      return random.nextInteger(this.getMin(), this.getMax() + 1)
    } else {
      return random.nextFloat(this.getMin(), this.getMax())
    }
  }
}
