
import Factory from '../Factory'

// Package fields
import BooleanField from '../Field/Boolean'
import ByteField from '../Field/Byte'
import EnumField from '../Field/Enum'
import NumberField from '../Field/Number'
import TextField from '../Field/Text'

// Singleton instance
let instance = null

/**
 * Factory for field objects
 */
export default class FieldFactory extends Factory {
  /**
   * Constructor
   */
  constructor () {
    super()

    // Gather package field classes
    const invokables = {
      boolean: BooleanField,
      bytes: ByteField,
      enum: EnumField,
      number: NumberField,
      text: TextField
    }

    // Register each field
    for (let name in invokables) {
      this.register(name, invokables[name])
    }
  }

  /**
   * Configure a field object based on the provided specification.
   * @example
   * let variantField = FieldFactory.getInstance().create({
   *   name: 'variant',
   *   type: 'enum'
   * })
   * @param {object} spec Specification
   * @param {string} spec.name Name to provide to the field
   * @param {string} spec.type Field factory identifier to use
   * @throws If specification is malformed.
   * @throws If field type is unknown.
   * @return {Field} Configured field object
   */
  create (spec) {
    // Validate name
    if (!spec.name) {
      throw new Error(`Field specification requires a 'name' field.`)
    }

    // Validate type
    if (!spec.type) {
      throw new Error(`Field specification requires a 'type' field.`)
    } else if (!this.exists(spec.type)) {
      throw new Error(`Unknown Field type '${spec.type}'.`)
    }

    // Create field object
    return super.create(spec.type, spec.name, spec)
  }

  /**
   * Get field factory singleton instance.
   * @return {FieldFactory}
   */
  static getInstance () {
    if (instance === null) {
      instance = new FieldFactory()
    }
    return instance
  }
}
