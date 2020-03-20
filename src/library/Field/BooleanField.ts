
import BooleanFieldView from '../../views/FieldBoolean'
import Field, { FieldValidationResult } from './Field'
import FieldSpec from './FieldSpec'
import Random from '../Random'

/**
 * Boolean field specification type
 */
export type BooleanFieldSpec = FieldSpec & {
  /**
   * True option label. Defaults to 'Yes'.
   */
  trueLabel?: string

  /**
   * False option label. Defaults to 'No'.
   */
  falseLabel?: string
}

/**
 * Boolean field
 */
export default class BooleanField extends Field {
  /**
   * React component this model is represented by
   */
  protected viewComponent = BooleanFieldView

  /**
   * True label
   */
  private trueLabel: string

  /**
   * False label
   */
  private falseLabel: string

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: BooleanFieldSpec) {
    super(spec)
    this.trueLabel = spec.trueLabel || 'Yes'
    this.falseLabel = spec.falseLabel || 'No'
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
      trueLabel: this.trueLabel,
      falseLabel: this.falseLabel
    }
  }

  /**
   * Returns the true option label
   */
  getTrueLabel (): string {
    return this.trueLabel
  }

  /**
   * Sets the true option label
   * @param trueLabel - New true option label
   */
  setTrueLabel (trueLabel: string) {
    this.trueLabel = trueLabel
    this.updateView()
  }

  /**
   * Returns the false option label
   */
  getFalseLabel (): string {
    return this.falseLabel
  }

  /**
   * Sets the false option label
   * @param falseLabel - New false option label
   */
  setFalseLabel (falseLabel: string) {
    this.falseLabel = falseLabel
    this.updateView()
  }

  /**
   * Validates the given value.
   * @param value - Value to be validated
   * @returns True, if value is valid. If it is considered invalid either a
   * validation result object or false is returned.
   */
  validateValue (value: any): boolean|FieldValidationResult {
    if ([true, 1, '1', 'true'].indexOf(value) === -1 &&
        [false, 0, '0', 'false'].indexOf(value) === -1) {
      return {
        key: 'booleanInvalid',
        message: `The value is not a boolean`
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
    return super.filterValue([true, 1, '1', 'true'].indexOf(value) !== -1)
  }

  /**
   * Returns a randomly chosen value or `undefined` if not applicable.
   * @param random - Random number generator
   * @returns Randomly chosen value for this field
   */
  randomizeValue (random: Random): any|undefined {
    const value = super.randomizeValue(random)
    if (value !== undefined) {
      return value
    }
    return random.nextBoolean()
  }
}
