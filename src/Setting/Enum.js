
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
   * @param {string[]} [spec.options.descriptions] Value descriptions
   */
  constructor (name, spec) {
    super(name, spec)
    this._viewPrototype = EnumSettingView

    this._elements = []
    this._labels = []
    this._descriptions = []

    this.setElements(
      spec.options.elements,
      spec.options.labels || null,
      spec.options.descriptions || null,
      false)
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
   * Returns value descriptions.
   * @return {string[]} Value descriptions
   */
  getElementDescriptions () {
    return this._descriptions
  }

  /**
   * Sets possible values and labels.
   * @param {string[]} elements
   * @param {string[]} [labels=elements]
   * @param {string[]} [descriptions]
   * @param {boolean} [revalidate=true] Wether to revalidate current value.
   * @throws Throws an error if array of elements is empty.
   * @throws Throws an error if element and label arrays have different lengths.
   * @return {EnumSetting} Fluent interface
   */
  setElements (
    elements, labels = null, descriptions = null, revalidate = true) {
    if (elements.length === 0) {
      throw new Error(`Array of elements can't be empty.`)
    }

    if (labels !== null && elements.length !== labels.length) {
      throw new Error(`Element and label arrays require the same length.`)
    }

    if (descriptions !== null && elements.length !== descriptions.length) {
      throw new Error(`Element and description arrays require the same length.`)
    }

    this._elements = elements
    this._labels = labels !== null ? labels : elements
    this._descriptions = descriptions !== null
      ? descriptions
      : elements.map(() => null)

    // if no value is selected, select first element
    if (this._value === null) {
      this._value = this._elements[0]
    }

    // refresh view
    this.hasView() && this.getView().refresh()

    return revalidate ? this.revalidateValue() : this
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
   * @return {boolean|object} True if valid, message object or false if invalid.
   */
  validateValue (rawValue) {
    if (this._elements.indexOf(rawValue) === -1) {
      return {
        key: 'enumNotInHaystack',
        message: `The value was not found in the haystack`
      }
    }
    return super.validateValue(rawValue)
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
