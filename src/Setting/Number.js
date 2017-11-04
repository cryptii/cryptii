
import NumberSettingView from '../View/Setting/Number'
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
   * @param {?number} [spec.options.step=1] Step size.
   * @param {?number} [spec.options.min=null] Minimum value (inclusive)
   * @param {?number} [spec.options.max=null] Maximum value (exclusive)
   */
  constructor (name, spec) {
    super(name, spec)
    this._viewPrototype = NumberSettingView

    const options = spec.options || {}
    this._integer = options.integer || false
    this._step = options.step || 1
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
   * Returns how much to add or remove when stepping value up or down.
   * @return {?number}
   */
  getStep () {
    return this._step
  }

  /**
   * Sets step size.
   * @param {?number} step
   * @return {NumberSetting} Fluent interface
   */
  setStep (step) {
    this._step = step
    return this
  }

  /**
   * Step up or down value until finding the next valid one.
   * @param {number} step Relative step size.
   * @param {number} [maxTries=100] Max number of tries to find a valid value.
   * @return {?number} Resulting value or null if unable to find.
   */
  stepValue (step, maxTries = 100) {
    let value = this.getValue()
    let tries = 0
    let valueFound = false

    // step until a valid value is found
    while (
      !valueFound &&
      tries++ < maxTries &&
      // eslint-disable-next-line no-unmodified-loop-condition
      (step > 0 || value !== this._min) &&
      // eslint-disable-next-line no-unmodified-loop-condition
      (step < 0 || value !== this._max)
    ) {
      // add step to value
      value += step

      // check bounds
      value = this._max !== null ? Math.min(value, this._max) : value
      value = this._min !== null ? Math.max(value, this._min) : value

      // validate value
      valueFound = this.validateValue(value) === true
    }

    return valueFound ? value : null
  }

  /**
   * Step up value.
   * @return {NumberSetting} Fluent interface
   */
  stepUp () {
    let value = this.stepValue(this._step)
    return value !== null ? this.setValue(value) : this
  }

  /**
   * Step down value.
   * @return {NumberSetting} Fluent interface
   */
  stepDown () {
    let value = this.stepValue(-this._step)
    return value !== null ? this.setValue(value) : this
  }

  /**
   * Returns minimum value (inclusive).
   * @return {?number} Minimum value
   */
  getMin () {
    return this._min
  }

  /**
   * Sets minimum value (inclusive).
   * @param {?number} min Minimum value
   * @return {NumberSetting} Fluent interface
   */
  setMin (min) {
    this._min = min
    return this
  }

  /**
   * Returns maximum value (exclusive).
   * @return {?number} Maximum value
   */
  getMax () {
    return this._max
  }

  /**
   * Sets maximum value (exclusive).
   * @param {?number} max Maximum value
   * @return {NumberSetting} Fluent interface
   */
  setMax (max) {
    this._max = max
    return this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid.
   */
  validateValue (rawValue) {
    let value = this.filterValue(rawValue)

    // is numeric
    if (isNaN(value) || !isFinite(value)) {
      return {
        key: 'numberNotNumeric',
        message: `The value is not numeric`
      }
    }

    // validate min value
    if (this._min !== null && value < this._min) {
      return {
        key: 'numberTooSmall',
        message: `The value is less than ${this._min}`
      }
    }

    // validate max value
    if (this._max !== null && value >= this._max) {
      return {
        key: 'numberTooLarge',
        message: `The value is greater than ${this._max}`
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

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {NumberSettingView} view
   * @param {number} value
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }
}
