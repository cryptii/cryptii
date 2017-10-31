
import BooleanSettingView from '../View/Setting/Boolean'
import Setting from '../Setting'

const knownTrueValues = [true, 1, '1', 'true']
const knownFalseValues = [false, 0, '0', 'false']

/**
 * Boolean Setting.
 */
export default class BooleanSetting extends Setting {
  /**
   * Setting constructor.
   * @param {string} name
   * @param {Object} [spec] See {@link Setting.constructor}
   * @param {mixed} [spec.options] Setting options
   * @param {string} [spec.options.trueLabel='Yes'] Label for 'true' choice
   * @param {string} [spec.options.falseLabel='No'] Label for 'false' choice
   */
  constructor (name, spec = {}) {
    super(name, spec)
    this._viewPrototype = BooleanSettingView

    const options = spec.options || {}
    this._trueLabel = options.trueLabel || 'Yes'
    this._falseLabel = options.falseLabel || 'No'
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
        message: `The value is not a boolean`
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
   * Returns a randomly chosen value.
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    return random.nextBoolean()
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {BooleanSettingView} view
   * @param {mixed} value
   * @return {BooleanSetting} Fluent interface
   */
  viewValueDidChange (view, value) {
    return this.setValue(value, view)
  }
}
