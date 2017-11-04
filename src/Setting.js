
import Chain from './Chain'
import Random from './Random'
import SettingView from './View/Setting'
import StringUtil from './StringUtil'
import Viewable from './Viewable'

/**
 * Abstract setting.
 */
export default class Setting extends Viewable {
  /**
   * Setting constructor. Override is required to call super.
   * @param {string} name
   * @param {Object} [spec]
   * @param {string} [spec.label] Setting label. Defaults to Setting name.
   * @param {boolean} [spec.visible=true] Wether setting is visible.
   * @param {number} [spec.priority=1] Settings will be ordered by
   * priority (descending).
   * @param {number} [spec.width=12] Setting width in columns (1-12).
   * @param {mixed} [spec.value] Default Setting value.
   * @param {function(rawValue: mixed, setting: Setting): boolean|object}
   * [spec.validateValue] Function to execute whenever a value
   * gets validated, returns true if valid.
   * @param {function(rawValue: mixed, setting: Setting): mixed}
   * [spec.filterValue] Function to execute whenever a value
   * gets filtered, returns filtered value.
   * @param {function(random: Random, setting: Setting): mixed}
   * [spec.randomizeValue] Function to execute whenever a random Setting value
   * gets requested, returns randomly chosen value.
   */
  constructor (name, spec = {}) {
    super()

    this._name = name
    this._value = spec.value || null

    this._valid = true
    this._message = null
    this._messageKey = null

    this._delegate = null

    this._validateValueCallback = spec.validateValue || null
    this._filterValueCallback = spec.filterValue || null
    this._randomizeValueCallback = spec.randomizeValue || null

    // view related properties
    this._label = spec.label || StringUtil.camelCaseToRegular(name, ' ')
    this._visible = spec.visible !== false
    this._priority = spec.priority || 1
    this._width = spec.width || 12
    this._viewPrototype = SettingView
  }

  /**
   * Returns name.
   * @return {string} Setting name
   */
  getName () {
    return this._name
  }

  /**
   * Returns label.
   * @return {string} Setting label
   */
  getLabel () {
    return this._label
  }

  /**
   * Returns wether Setting is visible.
   * @return {boolean} True, if visible.
   */
  isVisible () {
    return this._visible
  }

  /**
   * Sets wether Setting is visible.
   * @param {boolean} visible
   * @return {Setting} Fluent interface
   */
  setVisible (visible) {
    this._visible = visible
    this.hasDelegate() && this.getDelegate().settingNeedsLayout(this)
    return this
  }

  /**
   * Returns priority of Setting.
   * @return {number} Setting priority
   */
  getPriority () {
    return this._priority
  }

  /**
   * Sets the priority of Setting.
   * @param {number} priority Setting priority
   * @return {Setting} Fluent interface
   */
  setPriority (priority) {
    this._priority = priority
    this.hasDelegate() && this.getDelegate().settingNeedsLayout(this)
    return this
  }

  /**
   * Returns width as number of columns (1-12).
   * @return {number} Number of columns (1-12)
   */
  getWidth () {
    return this._width
  }

  /**
   * Sets width as number of columns (1-12).
   * @param {number} width Number of columns (1-12)
   * @return {Setting} Fluent interface
   */
  setWidth (width) {
    this._width = width
    return this
  }

  /**
   * Returns the delegate.
   * @return {?Object}
   */
  getDelegate () {
    return this._delegate
  }

  /**
   * Returns true, if delegate is set.
   * @return {boolean} True, if delegate is set.
   */
  hasDelegate () {
    return this._delegate !== null
  }

  /**
   * Sets the delegate.
   * @param {?Object} delegate
   * @return {Setting} Fluent interface
   */
  setDelegate (delegate) {
    this._delegate = delegate
    return this
  }

  /**
   * Returns true, if value is valid.
   * @return {boolean} True, if valid.
   */
  isValid () {
    return this._valid
  }

  /**
   * Returns value.
   * @return {mixed}
   */
  getValue () {
    return this._value
  }

  /**
   * Returns a message that explains why the current value is invalid.
   * @return {null|string}
   */
  getMessage () {
    return this._message
  }

  /**
   * Returns a message key identifying the reason the current value is invalid.
   * @return {null|string}
   */
  getMessageKey () {
    return this._messageKey
  }

  /**
   * Sets value, validates it, filters it and notifies delegate.
   * @param {mixed} rawValue Setting value.
   * @param {?Object} [sender] Sender object of this request.
   * Delegate will only be notified if it differs from given sender.
   * @return {Setting} Fluent interface
   */
  setValue (rawValue, sender = null) {
    // validate value
    let validationResult = this.validateValue(rawValue)
    this._valid = validationResult === true

    // update message
    if (typeof validationResult === 'object') {
      this._message = validationResult.message
      this._messageKey = validationResult.key
    } else {
      this._message = null
      this._messageKey = null
    }

    this.updateView()

    if (!this._valid) {
      this._value = rawValue
      return this
    }

    // filter value
    const value = this.filterValue(rawValue)

    // check if value changed
    let equal = value instanceof Chain
      ? value.isEqualTo(this._value)
      : this._value === value

    if (!equal) {
      this._value = value

      // update value in view
      if (this.hasView() && this.getView() !== sender) {
        this.getView().updateValue()
      }

      // notify delegate only if setting value is valid
      if (this.hasDelegate() && this.getDelegate() !== sender) {
        this.getDelegate().settingValueDidChange(this, value)
      }
    }

    return this
  }

  /**
   * Revalidates current value, sets {@link Setting.isValid} flag to
   * false if not valid.
   * @return {Setting} Fluent interface
   */
  revalidateValue () {
    return this.setValue(this.getValue())
  }

  /**
   * Validates given raw value. Called whenever a value gets set
   * using {@link Setting.setValue}. Override is required to call super.
   * @override
   * @param {mixed} rawValue Value to be validated.
   * @return {boolean|object} True if valid, message object or false if invalid.
   */
  validateValue (rawValue) {
    if (this._validateValueCallback !== null) {
      return this._validateValueCallback(rawValue, this)
    }
    // generic Setting objects accept any value
    return true
  }

  /**
   * Filters given raw value. Called whenever a value gets set
   * using {@link Setting.setValue}. Override is required to call super.
   * @override
   * @param {mixed} rawValue Value to be filtered.
   * @return {mixed} Filtered value
   */
  filterValue (rawValue) {
    if (this._filterValueCallback !== null) {
      return this._filterValueCallback(rawValue, this)
    }
    // generic Setting objects don't filter
    return rawValue
  }

  /**
   * Applies a randomly chosen value.
   * Uses {@link Setting.randomizeValue} internally.
   * @param {Random} [random] Random number generator
   * @return {Setting} Fluent interface
   */
  randomize (random = null) {
    let value = this.randomizeValue(random || new Random())
    return this.setValue(value)
  }

  /**
   * Returns a randomly chosen value.
   * @override
   * @param {Random} random Random number generator
   * @return {mixed} Randomly chosen value
   */
  randomizeValue (random) {
    if (this._randomizeValueCallback !== null) {
      return this._randomizeValueCallback(random, this)
    }
    // generic Setting objects don't know how to choose a random value
    // leave the current value as is
    return this.getValue()
  }

  /**
   * Serializes Setting value to make it JSON serializable.
   * @override
   * @throws Throws an error if safe serialization not possible.
   * @return {mixed} Serialized data
   */
  serializeValue () {
    const value = this.getValue()

    if (
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string'
    ) {
      throw new Error(
        `Generic Settings can only serialize boolean, number and string ` +
        `values safely. Found value type ${typeof value}.`)
    }

    return value
  }

  /**
   * Extracts value from {@link Setting.serializeValue} serialized data
   * and applies it to this Setting.
   * @override
   * @param {mixed} data Serialized data
   * @return {Setting} Fluent interface
   */
  extractValue (data) {
    this.setValue(data)
    return this
  }
}
