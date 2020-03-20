
import BinaryField from './BinaryField'
import BooleanField from './BooleanField'
import EnumField from './EnumField'
import Field from './Field'
import FieldSpec from './FieldSpec'
import NumberField from './NumberField'
import TextField from './TextField'

/**
 * Factory class tasked with creating and configuring field instances.
 */
export default class FieldFactory {
  /**
   * Static shared instance
   */
  private static sharedInstance?: FieldFactory

  /**
   * Object mapping names to field class invokables.
   */
  private namedInvokables: { [index: string] : any } = {
    binary: BinaryField,
    boolean: BooleanField,
    enum: EnumField,
    number: NumberField,
    text: TextField,
  }

  /**
   * Configure a field object based on the provided specification.
   *
   * @example
   * Example creation of a field using the field factory:
   *
   * ```ts
   * let variantField = FieldFactory.sharedInstance.create({
   *   name: 'variant',
   *   type: 'enum'
   * })
   * ```
   *
   * @param spec - Field spec
   * @throws {Error} If field specification is malformed.
   * @throws {Error} If field type is not registered.
   * @returns Promise that resolves to the newly created field instance
   */
  create (spec: FieldSpec): Field {
    // Validate name
    if (typeof spec.name !== 'string') {
      throw new Error(`Field specification requires a 'name' field.`)
    }

    // Validate type
    if (typeof spec.type !== 'string') {
      throw new Error(`Field specification requires a 'type' field.`)
    }

    // TODO: Allow to dynamically import fields
    const invokable = this.namedInvokables[spec.type]

    // Instantiate and configure field
    return new invokable(spec)
  }

  /**
   * Register field invokable to specified name.
   * @param name - Field name
   * @param invokable - Field invokable
   * @throws If the given name has already been assigned to a field.
   */
  register (name: string, invokable: any): void {
    if (this.namedInvokables[name] === undefined) {
      throw new Error(`Name '${name}' has already been assigned to a field.`)
    }
    this.namedInvokables[name] = invokable
  }

  /**
   * Lazily creates a shared FieldFactory instance and returns it.
   * @returns Shared FieldFactory instance
   */
  static getSharedInstance (): FieldFactory {
    if (this.sharedInstance === undefined) {
      this.sharedInstance = new FieldFactory()
    }
    return this.sharedInstance
  }
}
