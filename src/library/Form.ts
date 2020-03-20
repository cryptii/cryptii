
import Field from './Field/Field'
import FieldFactory from './Field/FieldFactory'
import FieldSpec from './Field/FieldSpec'
import FormView from '../views/Form'
import Viewable from './Viewable'

/**
 * Form delegate interface
 */
export interface FormDelegate {
  /**
   * Triggered when an embedded field value has changed.
   * @param form - Sender form
   * @param field - Sender field
   * @param value - New value
   */
  formValueDidChange? (form: Form, field: Field, value: any): void
}

/**
 * Collection of fields.
 */
export default class Form extends Viewable {
  /**
   * Object mapping field names to their respective field instances.
   *
   * @example
   * Example how to access fields using this property:
   *
   * ```ts
   * const fields = Object.values(form.fields)
   * const variantField = form.fields.variant
   * ```
   */
  public readonly fields: { [index: string] : Field } = {}

  /**
   * Object mapping field names to their respective field values.
   *
   * @example
   * Example how to access or manipulate field values using this property:
   *
   * ```ts
   * const variant = form.fields.variant
   * form.fields.variant = 'default'
   * ```
   */
  public readonly values: { [index: string] : any } = {}

  /**
   * React component this model is represented by
   */
  protected viewComponent = FormView

  /**
   * Field factory instance new fields are created by
   */
  private fieldFactory?: FieldFactory

  /**
   * Wether the form is in its expanded state showing all fields
   */
  private expanded: boolean = false

  /**
   * Form delegate getting informed about value changes on embedded fields
   */
  private delegate?: FormDelegate

  /**
   * Constructor
   * @param fieldsOrSpecs - Array of field instances or spec objects
   * @param fieldFactory - Field factory instance to create field instances by
   */
  constructor (
    fieldsOrSpecs: (Field | FieldSpec)[] = [],
    fieldFactory?: FieldFactory
  ) {
    super()
    this.fieldFactory = fieldFactory
    this.addFields(fieldsOrSpecs)
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    let fields = Object.values(this.fields)
    if (!this.expanded) {
      fields = fields.filter(field => field.getPriority() >= 0)
    }
    return {
      fields: fields.map(field => field.render()),
      fieldNames: fields.map(field => field.getName()),
      widths: fields.map(field => field.getWidth()),
      onToggleClick: () => this.setExpanded(!this.isExpanded()),
      expanded: this.isExpanded(),
      expandable: this.isExpandable()
    }
  }

  /**
   * Lazily creates and returns the field factory.
   */
  getFieldFactory (): FieldFactory {
    if (this.fieldFactory === undefined) {
      this.fieldFactory = FieldFactory.getSharedInstance()
    }
    return this.fieldFactory
  }

  /**
   * Sets the field factory.
   * @param fieldFactory - New field factory instance
   */
  setFieldFactory (fieldFactory: FieldFactory): void {
    this.fieldFactory = fieldFactory
  }

  /**
   * Returns wether the form contains expandable fields of negative priority.
   */
  isExpandable (): boolean {
    let count = 0
    for (let name in this.fields) {
      if (this.fields[name].getPriority() < 0) {
        count ++
      }
    }
    return count > 0
  }

  /**
   * Returns true, if the form is in it's expanded state.
   */
  isExpanded (): boolean {
    return this.expanded
  }

  /**
   * Sets wether the form should show all fields.
   * @param expanded - True, if form is expanded
   */
  setExpanded (expanded: boolean): void {
    this.expanded = expanded
    this.updateView()
  }

  /**
   * Returns the delegate.
   */
  getDelegate (): FormDelegate | undefined {
    return this.delegate
  }

  /**
   * Sets the delegate.
   * @param delegate - New delegate
   */
  setDelegate (delegate: FormDelegate | undefined): void {
    this.delegate = delegate
  }

  /**
   * Provide a form iterator to easily iterate through all embedded fields
   */
  [Symbol.iterator] () {
    return Object.values(this.fields)
  }

  /**
   * Returns an array of embedded visible fields.
   * @returns An array of visible fields
   */
  getVisibleFields (): readonly Field[] {
    return Object.values(this.fields)
      .filter(field => field.isVisible())
  }

  /**
   * Returns an array of embedded visible and invalid fields.
   * @returns An array of visible and invalid fields
   */
  getInvalidFields (): readonly Field[] {
    return Object.values(this.fields)
      .filter(field => field.isVisible() && !field.isValid())
  }

  /**
   * Returns field instance for the given name.
   * @param name - Field name
   * @returns Field instance or null, if not assigned
   */
  getField (name: string): Field|null {
    return this.fields[name] || null
  }

  /**
   * Adds multiple fields to the form.
   * @param fieldsOrSpecs - Array of fields or spec objects
   */
  addFields (fieldsOrSpecs: (Field|FieldSpec)[]): void {
    fieldsOrSpecs.forEach(this.addField.bind(this))
  }

  /**
   * Adds a single field to the form.
   * @param fieldOrSpec - Field instance or spec object
   * @throws If field name is already assigned.
   */
  addField (fieldOrSpec: Field|FieldSpec): void {
    // Resolve spec to a field instance
    let field: Field
    if (fieldOrSpec instanceof Field) {
      field = fieldOrSpec
    } else {
      const spec = fieldOrSpec
      // Choose default priority based on existing fields
      if (spec.priority === undefined) {
        spec.priority = this.calculateDefaultFieldPriority()
      }
      // Let the factory create an instance from the given spec
      field = this.getFieldFactory().create(spec)
    }

    // Verify that given field name is not already assigned
    if (this.fields[field.getName()] !== undefined) {
      throw new Error(
        `Name '${field.getName()}' is already assigned to a field.`)
    }

    // Add new field while keeping all fields sorted
    this.sortFields(field)

    // Attach field delegate and view parent
    field.setDelegate(this)

    // Show field
    if (field.isVisible()) {
      field.setParentView(this)
      this.updateView()
    }
  }

  /**
   * Removes the given field instance from the form.
   * @param nameOrField - Field name or instance to be removed
   */
  removeField (nameOrField: string|Field): void {
    // TODO: Needs implementation
  }

  /**
   * Calculates the default priority for the next field to be added.
   * By default, new fields will be added to the end, thus, receiving
   * the lowest priority.
   */
  private calculateDefaultFieldPriority (): number {
    const fields = Object.values(this.fields)
    if (fields.length === 0) {
      return 1000
    }
    let lowestPriority = fields[0].getPriority()
    for (let i = 1; i < fields.length; i++) {
      lowestPriority = Math.min(lowestPriority, fields[i].getPriority())
    }
    return lowestPriority - 1
  }

  /**
   * Sort the embedded fields by priority in descending order and optionally
   * incorporate a new field.
   * @param newField - New field instance to be incorporated
   */
  private sortFields (newField?: Field): void {
    const fields = Object.values(this.fields)
    let field

    // Detach all field and value properties
    for (let i = 0; i < fields.length; i++) {
      field = fields[i]
      delete this.fields[field.getName()]
      delete this.values[field.getName()]
    }

    // Append new field, if any
    if (newField !== undefined) {
      fields.push(newField)
    }

    // Sort fields by priority in descending order
    fields.sort((a, b) => b.getPriority() - a.getPriority())

    // Attach field and value properties in order
    for (let i = 0; i < fields.length; i++) {
      field = fields[i]

      // Attach field property
      Object.defineProperty(this.fields, field.getName(), {
        value: field,
        configurable: true,
        enumerable: true,
      })

      // Attach field value property
      Object.defineProperty(this.values, field.getName(), {
        get: this.getFieldValue.bind(this, field.getName()),
        set: this.setFieldValue.bind(this, field.getName()),
        configurable: true,
        enumerable: true,
      })
    }
  }

  /**
   * Returns the field value for the given field name.
   * @param name - Field name
   * @throws If no field is assigned to the given field name.
   */
  getFieldValue (name: string): any {
    if (this.fields[name] === undefined) {
      throw new Error(`There is no field assigned to the name '${name}'.`)
    }
    return this.fields[name].getValue()
  }

  /**
   * Sets the field value for the given field name.
   * @param name - Field name
   * @param value - New value
   * @throws If no field is assigned to given field name.
   */
  setFieldValue (name: string, value: any): void {
    if (this.fields[name] === undefined) {
      throw new Error(`There is no field assigned to the name '${name}'.`)
    }
    this.fields[name].setValue(value)
  }

  /**
   * Updates the named field values provided by the given object.
   * @param namedValues - Object mapping names to new field values
   * @throws If no field is assigned to the given field name.
   */
  setFieldValues (namedValues: { [index: string] : any }): void {
    for (let name in namedValues) {
      this.setFieldValue(name, namedValues[name])
    }
  }

  /**
   * Returns true, if the form is valid.
   */
  isValid (): boolean {
    return this.getInvalidFields().length === 0
  }

  /**
   * Returns true, if at least one embedded visible field is randomizable.
   */
  isRandomizable (): boolean {
    return this.getVisibleFields()
      .find(field => field.isRandomizable()) !== undefined
  }

  /**
   * Randomizes visible randomizable fields.
   */
  randomize (): void {
    this.getVisibleFields()
      .filter(field => field.isRandomizable())
      .forEach(field => field.randomize())
  }

  /**
   * Serializes visible field values to a JSON serializable object.
   * @throws If a visible field is invalid.
   */
  serializeValues (): any {
    const data: any = {}
    for (let name in this.fields) {
      if (!this.fields[name].isValid()) {
        throw new Error(
          `Field '${name}' is invalid and thus can't serialize it's value.`);
      }
      data[name] = this.fields[name].serializeValue()
    }
    return data
  }

  /**
   * Extracts field values serialized by {@link Form.serializeValues} and
   * applies them on the respective form fields.
   * @param data - Serialized data
   */
  extract (data: any): void {
    this.setFieldValues(this.extractValues(data))
  }

  /**
   * Extracts field values serialized by {@link Form.serializeValues} and
   * returns them as an object.
   * @param data - Serialized data
   * @throws If the given data is not an object.
   * @throws If one of the field names is not assigned.
   * @return Extracted named values
   */
  extractValues (data: any): any {
    if (typeof data !== 'object') {
      throw new Error(
        `Serialized form values is expected to be an object mapping ` +
        `field names to their respective serialized values. ` +
        `Received value type '${typeof data}'.`)
    }
    const namedValues: any = {}
    for (let name in data) {
      if (typeof name !== 'string') {
        throw new Error(
          `Field name is expected to be a string. ` +
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
   * Called when the priority of a field has changed.
   * @param field - Sender field
   * @param priority - New priority
   */
  fieldPriorityDidChange (field: Field, priority: number): void {
    // Keep the field and value properties in decending priority order
    this.sortFields()
  }

  /**
   * Called when the value of a field has changed.
   * @param field - Sender field
   * @param value - New value
   */
  fieldValueDidChange (field: Field, value: any): void {
    // Notify delegate, if any
    if (this.delegate && this.delegate.formValueDidChange) {
      this.delegate.formValueDidChange(this, field, value)
    }
  }

  /**
   * Called when the visibility of a field has changed.
   * @param field - Sender field instance
   * @param visible - New visibility state
   */
  fieldVisibilityDidChange (field: Field, visible: boolean): void {
    // This viewable only acts as the parent view of a field if
    // the field is visible
    if (visible) {
      field.setParentView(this)
    } else {
      field.setParentView(undefined)
    }
    this.updateView()
  }
}
