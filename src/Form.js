import Field from './Field.js'
import FieldFactory from './Factory/Field.js'
import FormView from './View/Form.js'
import Viewable from './Viewable.js'

/**
 * Collection of fields.
 * @abstract
 */
export default class Form extends Viewable {
  /**
   * Constructor
   * @param {Field[]|object[]} fieldsOrSpecs Array of field instances or
   * spec objects
   * @param {Factory} fieldFactory Factory
   */
  constructor (fieldsOrSpecs = [], fieldFactory = null) {
    super()
    this._viewPrototype = FormView
    this._delegate = null

    this._fieldFactory = fieldFactory
    this._fields = []
    this.addFields(fieldsOrSpecs)
  }

  /**
   * Returns a shallow copy of the current form fields.
   * @return {Brick[]}
   */
  getFields () {
    return this._fields.slice()
  }

  /**
   * Returns currently invalid fields.
   * @return {Field[]} Array of invalid field instances
   */
  getInvalidFields () {
    return this._fields.filter(field => !field.isValid())
  }

  /**
   * Returns currently visible fields.
   * @return {Field[]} Array of visible field instances
   */
  getVisibleFields () {
    return this._fields.filter(field => field.isVisible())
  }

  /**
   * Adds multiple fields to the form.
   * @param {Field[]|object[]} fieldsOrSpecs Array of field instances or
   * spec objects
   * @return {Form} Fluent interface
   */
  addFields (fieldsOrSpecs) {
    fieldsOrSpecs.forEach(this.addField.bind(this))
    return this
  }

  /**
   * Returns field instance for given name.
   * @param {string} name Field name
   * @return {?Field} Field instance or null, if it does not exist
   */
  getField (name) {
    return this._fields.find(field => field.getName() === name) || null
  }

  /**
   * Adds a field to the form.
   * @param {Field|object} fieldOrSpec Field instance or spec object
   * @throws {Error} If field name is already assigned.
   * @return {Form} Fluent interface
   */
  addField (fieldOrSpec) {
    // Retrieve field instance
    let field = fieldOrSpec
    if (!(fieldOrSpec instanceof Field)) {
      // Resolve field spec to field instance
      const spec = fieldOrSpec
      if (spec.priority === undefined) {
        // Use default priority
        spec.priority = this._calculateDefaultPriority()
      }
      // Let the factory create an instance from given spec
      field = this.getFieldFactory().create(spec)
    }

    // Verify that given field name is not already assigned
    if (this.getField(field.getName())) {
      throw new Error(
        `Name '${field.getName()}' is already assigned to a field.`)
    }

    // Add field instance to the form
    this._fields.push(field)
    field.setDelegate(this)
    this._sortFields()

    // Add field subview
    if (field.isVisible() && this.hasView()) {
      this.getView().addSubview(field.getView())
    }

    return this
  }

  /**
   * Returns named field value.
   * @param {string} name Field name
   * @throws {Error} If no field is assigned to given field name.
   * @return {mixed} Field value
   */
  getFieldValue (name) {
    const field = this.getField(name)
    if (field === null) {
      throw new Error(`There is no field assigned to the name '${name}'.`)
    }
    return field.getValue()
  }

  /**
   * Sets named field.
   * @param {string} name Field name
   * @param {mixed} value Field value
   * @throws {Error} If no field is assigned to given field name.
   * @return {Form} Fluent interface
   */
  setFieldValue (name, value) {
    const field = this.getField(name)
    if (field === null) {
      throw new Error(`There is no field assigned to the name '${name}'.`)
    }
    field.setValue(value)
    return this
  }

  /**
   * Returns the current field value for each visible form field.
   * @return {object} Object mapping names to field values
   */
  getFieldValues () {
    const namedValues = {}
    this.getVisibleFields().forEach(field => {
      namedValues[field.getName()] = field.getValue()
    })
    return namedValues
  }

  /**
   * Applies each field value in given map.
   * @param {object} namedValues Map of names pointing to field values
   * @throws {Error} If no field is assigned to given field name.
   * @return {Form} Fluent interface
   */
  setFieldValues (namedValues) {
    for (const name in namedValues) {
      this.setFieldValue(name, namedValues[name])
    }
    return this
  }

  /**
   * Returns the field factory used upon field creation inside the form.
   * @return {Factory} Factory
   */
  getFieldFactory () {
    if (this._fieldFactory === null) {
      this._fieldFactory = FieldFactory.getInstance()
    }
    return this._fieldFactory
  }

  /**
   * Sets the field factory used upon field creation inside the form.
   * @param {Factory} fieldFactory Factory
   * @return {Pipe} Fluent interface
   */
  setFieldFactory (fieldFactory) {
    this._fieldFactory = fieldFactory
    return this
  }

  /**
   * Returns true, if the form is valid.
   * @return {boolean} True, if valid
   */
  isValid () {
    return this.getInvalidFields().length === 0
  }

  /**
   * Returns true, if the form is randomizable.
   * @return {boolean}
   */
  isRandomizable () {
    // A form is randomizable when at least one child field is randomizable
    return this._fields.find(field => field.isRandomizable()) !== undefined
  }

  /**
   * Randomizes visible randomizable fields.
   * @return {Form} Fluent interface
   */
  randomize () {
    this._fields
      .filter(field => field.isVisible() && field.isRandomizable())
      .forEach(field => field.randomize())
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
   * @return {Form} Fluent interface
   */
  setDelegate (delegate) {
    this._delegate = delegate
    return this
  }

  /**
   * Serializes visible field values to a JSON serializable object.
   * @throws {Error} If serialization is not possible.
   * @return {mixed} Serialized data
   */
  serializeValues () {
    const data = {}
    this.getVisibleFields().forEach(field => {
      data[field.getName()] = field.serializeValue()
    })
    return data
  }

  /**
   * Extracts field values serialized by {@link Form.serializeValues} and
   * applies them on the respective form fields.
   * @param {object} data Serialized data
   * @return {Form} Fluent interface
   */
  extract (data) {
    return this.setFieldValues(this.extractValues(data))
  }

  /**
   * Extracts field values serialized by {@link Form.serializeValues} and
   * returns them as an object.
   * @param {mixed} data Serialized data
   * @throws {Error} If serialized data is not an object.
   * @throws {Error} If one of the field names is not assigned.
   * @return {object} Extracted named values
   */
  extractValues (data) {
    if (typeof data !== 'object') {
      throw new Error(
        'Serialized form values is expected to be an object mapping ' +
        'field names to their respective serialized values. ' +
        `Received value type '${typeof data}'.`)
    }
    const namedValues = {}
    for (const name in data) {
      if (typeof name !== 'string') {
        throw new Error(
          'Field name is expected to be a string. ' +
          `Received type '${typeof name}'.`)
      }
      const field = this.getField(name)
      if (field === null) {
        throw new Error(`There is no field assigned to the name '${name}'.`)
      }
      namedValues[name] = field.extractValue(data[name])
    }
    return namedValues
  }

  /**
   * Calculates the default priority for the next field to be added.
   * By default, new fields will be added to the end, thus, receiving
   * the lowest priority.
   * @return {number} Priority
   */
  _calculateDefaultPriority () {
    if (this._fields.length === 0) {
      return 0
    }
    let lowestPriority = this._fields[0].getPriority()
    for (let i = 1; i < this._fields.length; i++) {
      lowestPriority = Math.min(lowestPriority, this._fields[i].getPriority())
    }
    return lowestPriority - 1
  }

  /**
   * Sorts the fields array by descending field priority.
   */
  _sortFields () {
    this._fields.sort((a, b) => b.getPriority() - a.getPriority())
  }

  /**
   * Triggered when view has been created.
   * @protected
   */
  didCreateView (view) {
    this._fields.forEach(field => this.fieldNeedsLayout(field))
  }

  /**
   * Triggered when a field priority did change.
   * @protected
   * @param {Field} field Sender field
   * @param {number} priority New priority
   */
  fieldPriorityDidChange (field, priority) {
    // Maintain sorted fields array
    this._sortFields()
  }

  /**
   * Triggered when a field layout property has changed.
   * @protected
   * @param {Field} field Sender field
   */
  fieldNeedsLayout (field) {
    if (this.hasView()) {
      // Remove field from superview
      field.getView().removeFromSuperview()

      // Add field back to view, if visible
      if (field.isVisible()) {
        this.getView().addSubview(field.getView())
      }
    }
  }

  /**
   * Triggered when a child field value has changed.
   * @param {Field} field Sender field
   * @param {mixed} value New field value
   */
  fieldValueDidChange (field, value) {
    // Notify delegate, if any
    if (this._delegate && this._delegate.formValueDidChange) {
      this.getDelegate().formValueDidChange(this, field, value)
    }
  }
}
