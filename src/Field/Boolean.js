import BooleanFieldView from '../View/Field/Boolean.js'
import Field from '../Field.js'

const knownTrueValues = [true, 1, '1', 'true']
const knownFalseValues = [false, 0, '0', 'false']

/**
 * Boolean field
 */
export default class BooleanField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {mixed} [spec] Field options
   * @param {string} [spec.trueLabel='Yes'] Label for 'true' choice
   * @param {string} [spec.falseLabel='No'] Label for 'false' choice
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = BooleanFieldView

    this._trueLabel = spec.trueLabel || 'Yes'
    this._falseLabel = spec.falseLabel || 'No'
  }

  /**
   * Returns label for 'true' choice.
   * @return {string}
   */
  getTrueLabel () {
    return this._trueLabel
  }

  /**
   * Returns label for 'false' choice.
   * @return {string}
   */
  getFalseLabel () {
    return this._falseLabel
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid.
   */
  validateValue (rawValue) {
    if (knownTrueValues.indexOf(rawValue) === -1 &&
        knownFalseValues.indexOf(rawValue) === -1) {
      return {
        key: 'booleanInvalid',
        message: 'The value is not a boolean'
      }
    }
    return super.validateValue(rawValue)
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
   * Returns a randomly chosen value or null if not applicable.
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    const value = super.randomizeValue(random)
    if (value !== null) {
      return value
    }
    return random.nextBoolean()
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {BooleanFieldView} view
   * @param {mixed} value
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }
}
