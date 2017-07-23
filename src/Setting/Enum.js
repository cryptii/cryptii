
import EnumSettingView from '../View/Setting/Enum'
import Setting from '../Setting'

/**
 * Enum Setting.
 */
export default class EnumSetting extends Setting {
  /**
   * Setting constructor.
   * @param {string} name
   * @param {Object} spec
   * @param {mixed} spec.options Setting options
   * @param {mixed[]} spec.options.elements Possible enum values
   * @param {string[]} [spec.options.labels] Value labels
   */
  constructor (name, spec) {
    super(name, spec)
    this._viewPrototype = EnumSettingView

    this.setElements(spec.options.elements, spec.options.labels || null)
  }

  /**
   * Returns possible values.
   * @return {mixed[]} Possible values
   */
  getElements () {
    return this._elements
  }

  /**
   * Returns value labels.
   * @return {string[]} Value labels
   */
  getElementLabels () {
    return this._labels
  }

  /**
   * Sets possible values and labels.
   * @param {string[]} elements
   * @param {string[]} [labels]
   * @throws Throws an error if array of elements is empty.
   * @throws Throws an error if element and label arrays have different lengths.
   * @return {EnumSetting} Fluent interface
   */
  setElements (elements, labels = null) {
    if (elements.length === 0) {
      throw new Error(`Array of elements can't be empty.`)
    }

    if (labels === null || elements.length !== labels.length) {
      throw new Error(`Element and label arrays need to have the same length.`)
    }

    this._elements = elements
    this._labels = labels !== null ? labels : elements
    return this.revalidateValue()
  }

  /**
   * Returns element at given index.
   * @param {number} index
   * @return {?EnumSetting}
   */
  getElementAt (index) {
    return index < this._elements.length
      ? this._elements[index]
      : null
  }

  /**
   * Returns selected element index.
   * @return {number}
   */
  getSelectedIndex () {
    return this._elements.indexOf(this.getValue())
  }

  /**
   * Sets selected element index. Triggers {@link Setting.setValue} internally.
   * @param {number} index
   * @return {EnumSetting} Fluent interface
   */
  setSelectedIndex (index) {
    let value = this._elements[index]
    return this.setValue(value)
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean} True, if valid.
   */
  validateValue (rawValue) {
    return super.validateValue(rawValue) &&
      this._elements.indexOf(rawValue) !== -1
  }

  /**
   * Returns a randomly chosen value.
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    return random.nextChoice(this._elements)
  }

  /**
   * Triggered when value has been changed inside the view.
   * @protected
   * @param {EnumSettingView} view
   * @param {mixed} value
   * @return {EnumSetting} Fluent interface
   */
  viewValueDidChange (view, value) {
    return this.setValue(value, view)
  }
}
