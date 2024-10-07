import Chain from './Chain.js'
import FieldView from './View/Field.js'
import Random from './Random.js'
import StringUtil from './StringUtil.js'
import Viewable from './Viewable.js'

/**
 * Abstract field
 */
export default class Field extends Viewable {
  /**
   * Constructor
   * @param {string} name Field name; expected to be camel cased
   * @param {object} [spec] Field spec
   * @param {string} [spec.label] Field label, defaults to title cased name
   * @param {mixed} [spec.value] Default field value
   * @param {object} [spec.delegate] Field delegate
   * @param {boolean} [spec.randomizable=true] Wether field is randomizable
   * @param {boolean} [spec.visible=true] Wether field is visible
   * @param {number} [spec.priority=0] Fields will be ordered by
   * priority in descending order.
   * @param {number} [spec.width=12] Field width in columns (1-12)
   * @param {function(rawValue: mixed, field: Field): boolean|object}
   * [spec.validateValue] Function to execute whenever a value
   * gets validated, returns true if valid.
   * @param {function(rawValue: mixed, field: Field): mixed}
   * [spec.filterValue] Function to execute whenever a value
   * gets filtered, returns filtered value.
   * @param {function(random: Random, field: Field): mixed}
   * [spec.randomizeValue] Function to execute whenever a random Field value
   * gets requested, returns randomly chosen value.
   */
  constructor (name, spec = {}) {
    super()
    this._viewPrototype = FieldView

    this._name = name
    this._value = spec.value !== undefined ? spec.value : null
    this._delegate = spec.delegate || null
    this._randomizable = spec.randomizable !== false

    // Validation
    this._valid = true
    this._message = null
    this._messageKey = null

    // Custom validate, filter and randomize functions
    this._validateValueCallback = spec.validateValue || null
    this._filterValueCallback = spec.filterValue || null
    this._randomizeValueCallback = spec.randomizeValue || null

    // View related properties
    this._label = spec.label || StringUtil.camelCaseToRegular(name)
    this._visible = spec.visible !== false
    this._priority = spec.priority !== undefined ? spec.priority : 0
    this._width = spec.width || 12
  }

  /**
   * Returns field name.
   * @return {string} Field name
   */
  getName () {
    return this._name
  }

  /**
   * Returns field label.
   * @return {string} Field label
   */
  getLabel () {
    return this._label
  }

  /**
   * Returns wether the field is visible.
   * @return {boolean} True, if visible
   */
  isVisible () {
    return this._visible
  }

  /**
   * Sets wether the field is visible.
   * @param {boolean} visible Field visibility
   * @return {Field} Fluent interface
   */
  setVisible (visible) {
    this._visible = visible
    if (this._delegate && this._delegate.fieldNeedsLayout) {
      this._delegate.fieldNeedsLayout(this)
    }
    return this
  }

  /**
   * Returns the field priority that determines the field order.
   * @return {number} Field priority
   */
  getPriority () {
    return this._priority
  }

  /**
   * Sets the field priority that determines the field order.
   * @param {number} priority Field priority
   * @return {Field} Fluent interface
   */
  setPriority (priority) {
    this._priority = priority
    if (this._delegate && this._delegate.fieldPriorityDidChange) {
      this._delegate.fieldPriorityDidChange(this, priority)
    }
    if (this._delegate && this._delegate.fieldNeedsLayout) {
      this._delegate.fieldNeedsLayout(this)
    }
    return this
  }

  /**
   * Returns the field width.
   * @return {number} Number of columns (1-12)
   */
  getWidth () {
    return this._width
  }

  /**
   * Sets the field with.
   * @param {number} width Number of columns (1-12)
   * @return {Field} Fluent interface
   */
  setWidth (width) {
    this._width = width
    this.updateView()
    if (this._delegate && this._delegate.fieldNeedsLayout) {
      this._delegate.fieldNeedsLayout(this)
    }
    return this
  }

  /**
   * Returns the delegate.
   * @return {?object}
   */
  getDelegate () {
    return this._delegate
  }

  /**
   * Sets the delegate.
   * @param {?object} delegate
   * @return {Field} Fluent interface
   */
  setDelegate (delegate) {
    this._delegate = delegate
    return this
  }

  /**
   * Returns true, if the value is valid.
   * @return {boolean} True, if valid
   */
  isValid () {
    return this._valid
  }

  /**
   * Returns a message that explains why the current value is invalid.
   * @return {?string}
   */
  getMessage () {
    return this._message
  }

  /**
   * Returns a message key identifying the reason the current value is invalid.
   * @return {?string}
   */
  getMessageKey () {
    return this._messageKey
  }

  /**
   * Returns the current value.
   * @return {mixed}
   */
  getValue () {
    return this._value
  }

  /**
   * Sets the value. Filters and validates value and updates the valid flag.
   * @param {mixed} rawValue Field value
   * @param {?object} [sender] Sender object. Only delegates that are not equal
   * to the sender will be notified.
   * @return {Field} Fluent interface
   */
  setValue (rawValue, sender = null) {
    // Validate value
    const validationResult = this.validateValue(rawValue)
    this._valid = validationResult === true

    // Update message
    if (!this._valid) {
      if (typeof validationResult === 'object') {
        this._message = validationResult.message
        this._messageKey = validationResult.key
      } else {
        this._message = 'The value is invalid'
        this._messageKey = 'invalid'
      }
    } else {
      this._message = null
      this._messageKey = null
    }

    // Update message on view
    this.hasView() && this.getView().setMessage(this.getMessage())

    if (!this._valid) {
      this._value = rawValue
      return this
    }

    // Filter value
    const value = this.filterValue(rawValue)

    // Check if value has changed
    // Use the special comparison method when dealing with chain instances
    const equal = value instanceof Chain
      ? value.isEqualTo(this._value)
      : this._value === value

    if (!equal) {
      this._value = value

      // Update the value in view
      if (this.hasView() && this.getView() !== sender) {
        this.getView().updateValue()
      }

      // Notify delegate, if it is interested
      if (this._delegate &&
          this._delegate !== sender &&
          this._delegate.fieldValueDidChange !== undefined) {
        this.getDelegate().fieldValueDidChange(this, value)
      }
    }

    return this
  }

  /**
   * Revalidates the current value, sets {@link Field.isValid} flag to
   * false if not valid.
   * @return {Field} Fluent interface
   */
  revalidateValue () {
    return this.setValue(this.getValue())
  }

  /**
   * Validates given raw value. Override is required to call super.
   * @override
   * @param {mixed} rawValue Value to be validated
   * @return {boolean|object} True if valid, message object or false if invalid
   */
  validateValue (rawValue) {
    if (this._validateValueCallback !== null) {
      return this._validateValueCallback(rawValue, this)
    }
    // Generic field objects accept any value
    return true
  }

  /**
   * Filters given raw value. Called whenever a value gets set
   * using {@link Field.setValue}. Override is required to call super.
   * @override
   * @param {mixed} rawValue Value to be filtered
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    if (this._filterValueCallback !== null) {
      return this._filterValueCallback(rawValue, this)
    }
    // Generic field objects don't filter
    return rawValue
  }

  /**
   * Returns true, if the field is randomizable.
   * @return {boolean}
   */
  isRandomizable () {
    return this._randomizable
  }

  /**
   * Applies a randomly chosen value.
   * Uses {@link Field.randomizeValue} internally.
   * Does nothing when randomizable is set to false.
   * @param {Random} [random] Random number generator
   * @return {Field} Fluent interface
   */
  randomize (random = null) {
    if (!this.isRandomizable()) {
      return this
    }
    const value = this.randomizeValue(random || new Random())
    if (value !== null) {
      return this.setValue(value)
    }
    return this
  }

  /**
   * Returns a randomly chosen value or `null` if not applicable.
   * @override
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    return this.randomizeValueWithCallback(random)
  }

  /**
   * Returns a randomly chosen value using the custom randomize value callback.
   * If not applicable, `null` is returned.
   * @protected
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValueWithCallback (random) {
    if (this._randomizeValueCallback !== null) {
      return this._randomizeValueCallback(random, this)
    }
    return null
  }

  /**
   * Returns wether a custom randomize value callback is set.
   * @return {boolean}
   */
  isCustomRandomizationSet () {
    return this._randomizeValueCallback !== null
  }

  /**
   * Serializes the field value to a JSON serializable value.
   * @override
   * @throws {Error} If field value is invalid.
   * @throws {Error} If serialization is not possible.
   * @return {mixed} Serialized data
   */
  serializeValue () {
    if (!this.isValid()) {
      throw new Error('Invalid field values can\'t be serialized.')
    }
    const value = this.getValue()
    if (
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string' &&
      value !== null
    ) {
      throw new Error(
        'Field value serialization is not possible. Generic fields can ' +
        'only serialize boolean, number, string or null values safely. ' +
        `Received value type '${typeof value}'.`)
    }
    return value
  }

  /**
   * Extracts value serialized by {@link Field.serializeValue} and applies
   * it on the field. Calls {@link Field.extractValue} internally.
   * @param {mixed} data Serialized data
   * @return {Field} Fluent interface
   */
  extract (data) {
    this.setValue(this.extractValue(data))
    return this
  }

  /**
   * Extracts a value serialized by {@link Field.serializeValue} and returns it.
   * @override
   * @param {mixed} data Serialized data
   * @return {mixed} Extracted value
   */
  extractValue (data) {
    return data
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    this.getView().setMessage(this.getMessage())
  }
}
