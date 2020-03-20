
import Field, { FieldValidationResult } from './Field'
import FieldSpec from './FieldSpec'
import NumberFieldView from '../../views/FieldNumber'
import Random from '../Random'

/**
 * Number field specification type
 */
export type NumberFieldSpec = FieldSpec & {
  /**
   * Wether to use integer values. Defaults to false.
   */
  integer?: boolean

  /**
   * Minimum value (inclusive). By default no min limit is set.
   */
  min?: number

  /**
   * Maximum value (exclusive). By default no max limit is set.
   */
  max?: number

  /**
   * Step size used when stepping up or down the value. Defaults to 1.
   */
  step?: number

  /**
   * Wether the value should rotate when stepping over min or max limits.
   * Rotation can only be enabled when both min and max values are set.
   * Defaults to false.
   */
  rotateStep?: boolean

  /**
   * Custom function called upon formatting extending the default behaviour
   * @param value - Value to be displayed
   * @param field - Sender field instance
   * @returns Formatted value string
   */
  formatValue?: (value: number, field: Field) => string
}

/**
 * Number field
 */
export default class NumberField extends Field {
  /**
   * React component this model is represented by
   */
  protected viewComponent = NumberFieldView

  /**
   * Wether to use integer values
   */
  private integer: boolean

  /**
   * Minimum value (inclusive)
   */
  private min?: number

  /**
   * Maximum value (exclusive)
   */
  private max?: number

  /**
   * Step size
   */
  private step: number

  /**
   * Wether the value should rotate when stepping over min or max limits.
   */
  private rotateStep: boolean

  /**
   * Custom function called upon formatting extending the default behaviour
   * @param value - Value to be displayed
   * @param field - Sender field instance
   * @returns Formatted value string
   */
  private customFormatValue?: ((value: number, field: Field) => string)

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: NumberFieldSpec) {
    super(spec)
    this.integer = spec.integer || false
    this.step = spec.step || 1
    this.min = spec.min
    this.max = spec.max
    this.rotateStep = spec.rotateStep || false
    this.customFormatValue = spec.formatValue
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      ...super.compose(),
      value: this.getValue(),
      onChange: this.setValue.bind(this),
      onStepUpClick: this.stepUp.bind(this),
      onStepDownClick: this.stepDown.bind(this)
    }
  }

  /**
   * Wether to use integer values
   */
  isInteger (): boolean {
    return this.integer
  }

  /**
   * Wether to use integer values
   * @param integer
   */
  setInteger (integer: boolean) {
    this.integer = integer
    this.revalidateValue()
  }

  /**
   * Minimum value (inclusive)
   */
  getMin (): number|undefined {
    return this.min
  }

  /**
   * Minimum value (inclusive)
   * @param min
   */
  setMin (min: number|undefined) {
    this.min = min
    this.revalidateValue()
  }

  /**
   * Maximum value (exclusive)
   */
  getMax (): number|undefined {
    return this.max
  }

  /**
   * Maximum value (exclusive)
   * @param max
   */
  setMax (max: number|undefined) {
    this.max = max
    this.revalidateValue()
  }

  /**
   * Step size used when stepping up or down the value
   */
  getStep (): number {
    return this.step
  }

  /**
   * Step size used when stepping up or down the value
   * @param step
   */
  setStep (step: number) {
    this.step = step
  }

  /**
   * Wether the value should rotate when stepping over min or max limits.
   * Rotation can only be enabled when both min and max values are set.
   */
  getRotateStep (): boolean {
    return this.rotateStep
  }

  /**
   * Wether the value should rotate when stepping over min or max limits.
   * Rotation can only be enabled when both min and max values are set.
   * @param rotateStep
   */
  setRotateStep (rotateStep: boolean) {
    this.rotateStep = rotateStep
  }

  /**
   * Step value and repeat the process until finding a valid value.
   * @param step - Relative step size
   * @param maxTries - Maximum number of tries
   * @returns Stepped value or undefined, if no value could be found within the
   * limited number of tries
   */
  stepValue (step: number, maxTries: number = 100): void {
    let value = this.getValue()
    let tries = 0
    let found = false

    // Step rotation is only available when a min and max value is set
    const rotateStep =
      this.rotateStep &&
      this.min !== undefined &&
      this.max !== undefined

    while (
      // Step value until a valid one is found or until max tries is reached
      !found &&
      tries++ < maxTries &&
      // Stop when reaching limits with rotation disabled
      // eslint-disable-next-line no-unmodified-loop-condition
      (rotateStep || step > 0 || value !== this.min) &&
      // eslint-disable-next-line no-unmodified-loop-condition
      (rotateStep || step < 0 || value !== this.max)
    ) {
      // Add step to value
      value += step

      // Rotate to min or max value when reaching limits
      if (rotateStep && value > this.max!) {
        value = this.min!
      } else if (rotateStep && value < this.min!) {
        // Step is added during rotation due to max being defined exclusive
        value = this.max! + step
      }

      // Validate value
      found = this.validateValue(value) === true
    }

    return found ? value : null
  }

  /**
   * Step up value.
   */
  stepUp (): void {
    const value = this.stepValue(this.step)
    if (value !== undefined) {
      this.setValue(value)
    }
  }

  /**
   * Step down value.
   */
  stepDown (): void {
    const value = this.stepValue(-this.step)
    if (value !== undefined) {
      this.setValue(value)
    }
  }

  /**
   * Returns a formatted value.
   * @returns Formatted value string
   */
  getFormattedValue (): string {
    if (this.isValid() && this.customFormatValue !== undefined) {
      return this.customFormatValue(this.getValue(), this)
    }
    return this.isValid().toString()
  }

  /**
   * Validates the given value.
   * @param value - Value to be validated
   * @returns True, if value is valid. If it is considered invalid either a
   * validation result object or false is returned.
   */
  validateValue (value: any): boolean|FieldValidationResult {
    value = this.filterValue(value)

    // Validate wether the value is a finite number
    if (isNaN(value) || !isFinite(value)) {
      return {
        key: 'numberNotNumeric',
        message: `The value is not numeric`
      }
    }

    // Validate min value
    if (this.min !== undefined && value < this.min) {
      return {
        key: 'numberTooSmall',
        message: `The value must be greater than or equal to ${this.min}`
      }
    }

    // Validate max value
    if (this.max !== undefined && value >= this.max) {
      return {
        key: 'numberTooLarge',
        message: `The value must be less than ${this.max}`
      }
    }

    return super.validateValue(value)
  }

  /**
   * Filters the given value.
   * @param value - Value to be filtered
   * @returns Filtered value
   */
  filterValue (value: any): any {
    return super.filterValue(this.integer ? parseInt(value) : parseFloat(value))
  }

  /**
   * Returns a randomly chosen value or undefined if not applicable.
   * @param random - Random number generator
   * @returns Randomly chosen value for this field
   */
  randomizeValue (random: Random): any|undefined {
    const value = super.randomizeValue(random)
    if (value !== undefined) {
      return value
    }
    if (this.min !== undefined && this.max !== undefined) {
      return this.integer
        ? random.nextInteger(this.min, Math.ceil(this.max) - 1)
        : random.nextFloat(this.min, this.max)
    }
    return undefined
  }
}
