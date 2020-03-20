
import Chain from '../Chain'
import FieldSpec from './FieldSpec'
import FieldView from '../../views/Field'
import MarkedChain from '../MarkedChain'
import Random from '../Random'
import StringUtil from '../Util/StringUtil'
import Viewable from '../Viewable'

/**
 * Field delegate interface
 */
export interface FieldDelegate {
  /**
   * Called when the priority of a field has changed.
   * @param field - Sender field instance
   * @param priority - New priority
   */
  fieldPriorityDidChange? (field: Field, priority: number): void

  /**
   * Called when the value of a field has changed.
   * @param field - Sender field instance
   * @param value - New value
   */
  fieldValueDidChange? (field: Field, value: any): void

  /**
   * Called when the visibility of a field has changed.
   * @param field - Sender field instance
   * @param visible - New visibility state
   */
  fieldVisibilityDidChange? (field: Field, visible: boolean): void
}

/**
 * Field validation result
 */
export type FieldValidationResult = {
  /**
   * Unique key identifying the reason why the value is invalid
   */
  key: string

  /**
   * Localized user message
   */
  message?: string

  /**
   * Marked chain that highlights the parts that need attention
   */
  markedChain?: MarkedChain
}

/**
 * Abstract field
 */
export default class Field extends Viewable {
  /**
   * Field name
   */
  private readonly name: string

  /**
   * Field value
   */
  private value: any

  /**
   * Holds the valid state for this field.
   */
  private valid: boolean

  /**
   * When the field is not valid this object provides the reason why.
   */
  private validationResult?: FieldValidationResult

  /**
   * Wether this field can be randomized
   */
  private randomizable: boolean

  /**
   * Field label
   */
  private label: string

  /**
   * Visibility
   */
  private visible: boolean

  /**
   * Fields are appearing in descending priority order in the form they are
   * embedded in.
   */
  private priority: number

  /**
   * Number of columns this field takes up (1-12)
   */
  private width: number

  /**
   * Custom function called upon validation extending the default behaviour
   * @param value - Value to be validated
   * @param field - Sender field instance
   * @returns True, if the given value is valid
   */
  customValidateValue?:
    ((value: any, field: Field) => boolean|FieldValidationResult)

  /**
   * Custom function called upon filtering extending the default behaviour
   * @param value - Value to be filtered
   * @param field - Sender field instance
   * @returns Filtered value
   */
  customFilterValue?: ((value: any, field: Field) => any)

  /**
   * Custom function called upon randomization extending the default behaviour
   * @param random - Random instance
   * @param field - Sender field instance
   * @returns Random value
   */
  customRandomizeValue?: ((random: Random, field: Field) => any)

  /**
   * React component this model is represented by
   */
  protected viewComponent = FieldView

  /**
   * Field delegate, usually set to the form the field is embedded in
   */
  private delegate?: FieldDelegate

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: FieldSpec) {
    super()

    // Configure field using the spec object
    this.name = spec.name
    this.label = spec.label || StringUtil.camelCaseToRegular(spec.name)
    this.value = this.filterValue(spec.value)
    this.valid = true
    this.randomizable = spec.randomizable === true
    this.visible = spec.visible !== false
    this.priority = spec.priority || 0
    this.width = spec.width || 12

    // Configure custom validate, filter and randomize functions
    this.customValidateValue = spec.validateValue
    this.customFilterValue = spec.filterValue
    this.customRandomizeValue = spec.randomizeValue
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    const result = this.getValidationResult()
    return {
      name: this.name,
      label: this.label,
      width: this.width,
      valid: this.valid,
      validationMessage: result && result.message ? result.message : undefined
    }
  }

  /**
   * Returns field name
   */
  getName (): string {
    return this.name
  }

  /**
   * Returns the current field value. If the field is invalid the raw invalid
   * value is being returned.
   */
  getValue (): any {
    return this.value
  }

  /**
   * Returns field label
   */
  getLabel (): string {
    return this.label
  }

  /**
   * Sets the field label
   * @param label - New label
   */
  setLabel (label: string) {
    if (this.label !== label) {
      this.label = label
      this.updateView()
    }
  }

  /**
   * Returns wether the field is currently visible.
   */
  isVisible (): boolean {
    return this.visible
  }

  /**
   * Sets wether the field is visible.
   * @param visible - New field visibility
   */
  setVisible (visible: boolean) {
    this.visible = visible

    // Inform delegate about visibility change
    if (this.delegate && this.delegate.fieldVisibilityDidChange) {
      this.delegate.fieldVisibilityDidChange(this, visible)
    }
  }

  /**
   * Returns the field priority that determines the field order.
   */
  isRandomizable (): number {
    return this.priority
  }

  /**
   * Sets wether the field is randomizable.
   * @param randomizable - New randomizable value
   */
  setRandomizable (randomizable: boolean) {
    this.randomizable = randomizable
  }

  /**
   * Returns the field priority that determines the field order.
   */
  getPriority (): number {
    return this.priority
  }

  /**
   * Sets the field priority that determines the field order.
   * @param priority - New priority
   */
  setPriority (priority: number) {
    this.priority = priority

    // Inform delegate about the priority change
    if (this.delegate && this.delegate.fieldPriorityDidChange) {
      this.delegate.fieldPriorityDidChange(this, priority)
    }
  }

  /**
   * Returns the field width in number of columns (1-12).
   */
  getWidth (): number {
    return this.width
  }

  /**
   * Sets the field width in number of columns (1-12).
   * @param width - New width
   */
  setWidth (width: number) {
    if (this.width !== width) {
      this.width = width
      this.updateView()
    }
  }

  /**
   * Returns the delegate.
   */
  getDelegate (): FieldDelegate | undefined {
    return this.delegate
  }

  /**
   * Sets the delegate.
   * @param delegate - New delegate
   */
  setDelegate (delegate: FieldDelegate | undefined): void {
    this.delegate = delegate
  }

  /**
   * Returns true, if the value is valid.
   */
  isValid (): boolean {
    return this.valid
  }

  /**
   * When the field is not valid this object provides the reason why.
   * @returns An object identifying the reason why the field is invalid or
   * undefined, if not available or applicable.
   */
  getValidationResult (): FieldValidationResult | undefined {
    return this.validationResult
  }

  /**
   * Wether this field can be randomized.
   * @returns True, if this field can be randomized
   */
  getRandomizable (): boolean {
    return this.randomizable
  }

  /**
   * Sets the value. Filters and validates value and updates the valid flag.
   * @param value - New value
   * @param sender - Sender object. Only delegates that are not equal
   * to the sender will be notified.
   */
  setValue (value: any, sender?: any): void {
    // Validate value
    let validationResult = this.validateValue(value)
    if (validationResult === false) {
      // Generic validation message if no specific one is given
      validationResult = {
        key: 'invalid',
        message: 'Invalid value'
      }
    }

    // Deal with invalid values
    if (validationResult !== true) {
      // Keep invalid raw value
      this.value = value
      this.valid = false
      this.validationResult = validationResult
      this.updateView()
    } else {
      // Filter value
      const filteredValue = this.filterValue(value)

      // Check if value has changed
      // Use the special comparison method when dealing with chain instances
      const equal = this.value instanceof Chain
        ? this.value.isEqualTo(filteredValue)
        : this.value === filteredValue

      if (!this.valid || !equal) {
        this.value = filteredValue
        this.valid = true
        this.validationResult = undefined
        this.updateView()

        // Notify delegate, if it is interested
        if (this.delegate !== sender &&
            this.delegate &&
            this.delegate.fieldValueDidChange) {
          this.delegate.fieldValueDidChange(this, filteredValue)
        }
      }
    }
  }

  /**
   * Revalidates the current value, sets {@link Field.valid} to `false` if
   * not valid.
   */
  revalidateValue (): void {
    this.setValue(this.value)
  }

  /**
   * Validates the given value.
   * @param value - Value to be validated
   * @returns True, if value is valid. If it is considered invalid either a
   * validation result object or false is returned.
   */
  validateValue (value: any): boolean | FieldValidationResult {
    if (this.customValidateValue !== undefined) {
      return this.customValidateValue(value, this)
    }
    // Generic fields accept any value
    return true
  }

  /**
   * Filters the given value.
   * @param value - Value to be filtered
   * @returns Filtered value
   */
  filterValue (value: any): any {
    if (this.customFilterValue !== undefined) {
      return this.customFilterValue(value, this)
    }
    // Generic field objects don't filter
    return value
  }

  /**
   * Applies a randomly chosen value.
   * Uses {@link Field.randomizeValue} internally.
   * Does nothing when randomizable is set to false.
   * @param random - Random number generator to be used. Uses the shared
   * instance by default.
   */
  randomize (random?: Random): void {
    if (this.randomizable) {
      const value = this.randomizeValue(random || Random.getSharedInstance())
      if (value !== null) {
        return this.setValue(value)
      }
    }
  }

  /**
   * Returns a randomly chosen value or undefined if not applicable.
   * @param random - Random number generator
   * @returns Randomly chosen value for this field
   */
  randomizeValue (random: Random): any | undefined {
    if (this.customRandomizeValue !== undefined) {
      return this.customRandomizeValue(random, this)
    }
    // Generic field objects don't know how to choose a random value
    return undefined
  }

  /**
   * Serializes the field value to a JSON serializable value.
   * @throws If field value is invalid.
   * @throws If serialization is not possible.
   * @returns Serialized data
   */
  serializeValue (): any {
    if (!this.valid) {
      throw new Error(`Invalid field values can't be serialized.`)
    }
    if (
      typeof this.value !== 'boolean' &&
      typeof this.value !== 'number' &&
      typeof this.value !== 'string' &&
      this.value !== null
    ) {
      throw new Error(
        `Field value serialization is not possible. Generic fields can ` +
        `only serialize boolean, number, string or null values safely. ` +
        `Received value type '${typeof this.value}'.`)
    }
    return this.value
  }

  /**
   * Extracts value serialized by {@link Field.serializeValue} and applies
   * it on the field. Calls {@link Field.extractValue} internally.
   * @param data - Serialized data
   */
  extract (data: any): void {
    this.setValue(this.extractValue(data))
  }

  /**
   * Extracts a value serialized by {@link Field.serializeValue} and returns it.
   * @param data - Serialized data
   * @return Extracted value
   */
  extractValue (data: any): any {
    return data
  }
}
