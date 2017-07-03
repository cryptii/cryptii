
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
  getLabels () {
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
}
