import EnumFieldView from '../View/Field/Enum.js'
import Field from '../Field.js'

/**
 * Enum field
 */
export default class EnumField extends Field {
  /**
   * Constructor
   * @param {string} name Field name
   * @param {Object} spec Field spec
   * @param {mixed[]} spec.elements Possible enum values
   * @param {string[]} [spec.labels] Value labels
   * @param {string[]} [spec.descriptions] Value descriptions
   * @param {string} [spec.style="default"] Field appearance
   */
  constructor (name, spec) {
    super(name, spec)
    this._viewPrototype = EnumFieldView

    this._elements = []
    this._labels = []
    this._descriptions = []
    this._style = spec.style || 'default'

    this.setElements(
      spec.elements,
      spec.labels || null,
      spec.descriptions || null,
      false
    )
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
   * @param {boolean} [revalidate=true] Wether to revalidate current value
   * @throws If given array of elements is empty.
   * @throws If element and label arrays have different lengths.
   * @return {EnumField} Fluent interface
   */
  setElements (
    elements, labels = null, descriptions = null, revalidate = true
  ) {
    if (elements.length === 0) {
      throw new Error('Array of elements can\'t be empty.')
    }

    if (labels !== null && elements.length !== labels.length) {
      throw new Error('Element and label arrays require the same length.')
    }

    if (descriptions !== null && elements.length !== descriptions.length) {
      throw new Error('Element and description arrays require the same length.')
    }

    this._elements = elements
    this._labels = labels !== null ? labels : elements
    this._descriptions =
      descriptions !== null
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
   * @param {number} index Element index
   * @return {?EnumField}
   */
  getElementAt (index) {
    return index < this._elements.length
      ? this._elements[index]
      : null
  }

  /**
   * Returns the selected element index.
   * @return {number}
   */
  getSelectedIndex () {
    return this._elements.indexOf(this.getValue())
  }

  /**
   * Sets the selected element index.
   * Triggers {@link Field.setValue} internally.
   * @param {number} index Element index
   * @return {EnumField} Fluent interface
   */
  setSelectedIndex (index) {
    const value = this._elements[index]
    return this.setValue(value)
  }

  /**
   * Returns the field appearance.
   * @return {string}
   */
  getStyle () {
    return this._style
  }

  /**
   * Sets the field appearance.
   * @param {string} style
   * @return {EnumField} Fluent interface
   */
  setStyle (style) {
    this._style = style
    this.hasView() && this.getView().setStyle(style)
    return this
  }

  /**
   * Validates given raw value.
   * @param {mixed} rawValue Value to be validated
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    if (this._elements.indexOf(rawValue) === -1) {
      return {
        key: 'enumNotInHaystack',
        message: 'The value must be occur in the list of elements'
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
   * @param {EnumFieldView} view
   * @param {mixed} value
   */
  viewValueDidChange (view, value) {
    this.setValue(value, view)
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    super.didCreateView(view)
    this.getView().setStyle(this.getStyle())
  }
}
