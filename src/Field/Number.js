import Field from '../Field.js'
import NumberFieldView from '../View/Field/Number.js'

/**
 * Number field
 */
export default class NumberField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {object} spec Field spec
   * @param {boolean} [spec.integer=false] Wether to use integer values
   * @param {boolean} [spec.useBigInt=false] Wether to cast big values to BigInt
   * @param {?number|BigInt} [spec.step=1] Step size
   * @param {?number|BigInt} [spec.min=null] Minimum value (inclusive)
   * @param {?number|BigInt} [spec.max=null] Maximum value (exclusive)
   * @param {?boolean} [spec.rotate=true] Wether the value should rotate
   * when stepping over limits. Rotation can only be enabled when both min and
   * max values are defined.
   * @param {function(value: number|BigInt, field: Field): ?string}
   * [spec.describeValue] Function describing the given numeric value in
   * a context-based human-readable way. It only gets called with valid values.
   */
  constructor (name, spec) {
    super(name, spec)
    this._viewPrototype = NumberFieldView

    this._integer = spec.integer || false
    this._useBigInt = spec.useBigInt && this._integer

    this._step = spec.step || 1

    this._min =
      spec.min !== undefined
        ? spec.min
        : (this._integer && !this._useBigInt ? Number.MIN_SAFE_INTEGER : null)
    this._max =
      spec.max !== undefined
        ? spec.max
        : (this._integer && !this._useBigInt ? Number.MAX_SAFE_INTEGER : null)

    this._rotate =
      spec.rotate !== undefined
        ? spec.rotate
        : (spec.min !== undefined && spec.max !== undefined)

    this._describeValueCallback = spec.describeValue || null
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
   * @return {NumberField} Fluent interface
   */
  setInteger (integer) {
    this._integer = integer
    return this.revalidateValue()
  }

  /**
   * Returns how much to add or remove when stepping value up or down.
   * @return {?number|BigInt}
   */
  getStep () {
    return this._step
  }

  /**
   * Sets step size.
   * @param {?number|BigInt} step Step size
   * @return {NumberField} Fluent interface
   */
  setStep (step) {
    this._step = step
    return this
  }

  /**
   * Step up or down value and repeat the process until finding a valid one.
   * @param {number|BigInt} step Relative step size
   * @param {number} [maxTries=100] Number of max tries to find a valid value
   * @return {?number|BigInt} Resulting value or null if unable to find
   */
  stepValue (step, maxTries = 100) {
    let value = this.getValue()
    let tries = 0
    let valueFound = false

    if (typeof value === 'bigint' || typeof step === 'bigint') {
      value = BigInt(value)
      step = BigInt(step)
    }

    while (
      // Step value until a valid one is found or until max tries is reached
      !valueFound &&
      tries++ < maxTries &&
      // Stop when reaching limits with rotation disabled
      // eslint-disable-next-line no-unmodified-loop-condition
      (this._rotate || step > 0 || value !== this._min) &&
      // eslint-disable-next-line no-unmodified-loop-condition
      (this._rotate || step < 0 || value !== this._max)
    ) {
      // Add step to value
      value += step

      // Rotate to min or max value when reaching limits
      if (this._rotate && value > this._max && this._rotate) {
        value = this._min
      } else if (this._rotate && value < this._min && this._rotate) {
        // Step is added during rotation due to max being defined exclusive
        value = this._max + step
      }

      // Validate value
      valueFound = this.validateValue(value) === true
    }

    return valueFound ? value : null
  }

  /**
   * Step up value.
   * @return {NumberField} Fluent interface
   */
  stepUp () {
    const value = this.stepValue(this._step)
    return value !== null ? this.setValue(value) : this
  }

  /**
   * Step down value.
   * @return {NumberField} Fluent interface
   */
  stepDown () {
    const value = this.stepValue(-this._step)
    return value !== null ? this.setValue(value) : this
  }

  /**
   * Returns minimum value (inclusive).
   * @return {?number|BigInt} Minimum value
   */
  getMin () {
    return this._min
  }

  /**
   * Sets minimum value (inclusive).
   * @param {?number|BigInt} min Minimum value
   * @return {NumberField} Fluent interface
   */
  setMin (min) {
    this._min = min
    return this.revalidateValue()
  }

  /**
   * Returns maximum value (exclusive).
   * @return {?number|BigInt} Maximum value
   */
  getMax () {
    return this._max
  }

  /**
   * Sets maximum value (exclusive).
   * @param {?number|BigInt} max Maximum value
   * @return {NumberField} Fluent interface
   */
  setMax (max) {
    this._max = max
    return this.revalidateValue()
  }

  /**
   * Returns wether the value should rotate when stepping over limits.
   * @return {boolean}
   */
  isRotate () {
    return this._rotate
  }

  /**
   * Sets wether the value should rotate when stepping over limits. Rotation can
   * only be enabled when both min and max values are defined.
   * @param {boolean} rotate Wether rotation is enabled
   * @return {NumberField} Fluent interface
   */
  setRotate (rotate) {
    this._rotate = rotate && this._min !== null && this._max !== null
    return this
  }

  /**
   * Returns a string describing the current numeric field value in a
   * context-based human-readable way. If no description is available, `null`
   * is returned.
   * @return {?string} Value description, if any
   */
  getValueDescription () {
    if (!this.isValid() || this._describeValueCallback === null) {
      return null
    }
    return this._describeValueCallback(this.getValue(), this)
  }

  /**
   * Requests an update to the value description in the current view that is not
   * related to a value change (e.g. when the description is depending on other
   * field value).
   * @return {NumberField} Fluent interface
   */
  setNeedsValueDescriptionUpdate () {
    this.hasView() && this.getView().updateValue()
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    const value = this.filterValue(rawValue)

    // Validate wether the value is a finite number
    if (typeof value !== 'bigint' && (isNaN(value) || !isFinite(value))) {
      return {
        key: 'numberNotNumeric',
        message: 'The value is not numeric'
      }
    }

    // Validate min value
    if (this._min !== null && value < this._min) {
      return {
        key: 'numberTooSmall',
        message: `The value must be greater than or equal to ${this._min}`
      }
    }

    // Validate max value
    if (this._max !== null && value >= this._max) {
      return {
        key: 'numberTooLarge',
        message: `The value must be less than ${this._max}`
      }
    }

    return super.validateValue(value)
  }

  /**
   * Filters given raw value.
   * @param {mixed} rawValue Value to be filtered
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    if (this._useBigInt && typeof rawValue === 'bigint') {
      // No filtering necessary
    } else if (this._useBigInt && typeof rawValue !== 'bigint') {
      const intValue = parseInt(rawValue)
      if (intValue >= Number.MIN_SAFE_INTEGER &&
          intValue <= Number.MAX_SAFE_INTEGER
      ) {
        rawValue = intValue
      } else if (!isNaN(intValue)) {
        rawValue = BigInt(rawValue)
      }
    } else if (this._integer) {
      rawValue = parseInt(rawValue)
    } else {
      rawValue = parseFloat(rawValue)
    }
    return super.filterValue(rawValue)
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
    if (this._min !== null && this._max !== null) {
      return this._integer
        ? random.nextInteger(this._min, Math.ceil(this._max) - 1)
        : random.nextFloat(this._min, this._max)
    }
    return null
  }

  /**
   * Serializes the field value to a JSON serializable value.
   * @throws {Error} If field value is invalid.
   * @throws {Error} If serialization is not possible.
   * @return {mixed} Serialized data
   */
  serializeValue () {
    // Encode BigInt instances as string
    const value = this.getValue()
    return typeof value === 'bigint' ? value.toString() : value
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {NumberFieldView} view
   * @param {number} value
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }
}
