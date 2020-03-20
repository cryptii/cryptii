
import Field from './Field'
import Random from '../Random'
import { FieldValidationResult } from './Field'

/**
 * Field specification type
 */
export default interface FieldSpec {
  /**
   * Field name. By convention field names are written camel cased.
   */
  name: string

  /**
   * Field type used by the field factory to identify the field constructable
   */
  type: string

  /**
   * Field label. Defaults to the field name.
   */
  label?: string

  /**
   * Initial field value
   */
  value: any

  /**
   * Wether this field can be randomized. Defaults to `false`.
   */
  randomizable?: boolean

  /**
   * Initial visibility state of the field. Defaults to `true`.
   */
  visible?: boolean

  /**
   * Fields are appearing in descending priority order in the form they are
   * embedded in. By default fields are added to the end of the form.
   */
  priority?: number

  /**
   * Number of columns this field takes up (1-12). Defaults to 12.
   */
  width?: number

  /**
   * Custom function called upon validation extending the default behaviour
   * @param value - Value to be validated
   * @param field - Sender field instance
   * @returns True, if the given value is valid
   */
  validateValue?: (value: any, field: Field) => boolean | FieldValidationResult

  /**
   * Custom function called upon filtering extending the default behaviour
   * @param value - Value to be filtered
   * @param field - Sender field instance
   * @returns Filtered value
   */
  filterValue?: (value: any, field: Field) => any

  /**
   * Custom function called upon randomization extending the default behaviour
   * @param random - Random instance
   * @param field - Sender field instance
   * @returns Random value
   */
  randomizeValue?: (random: Random, field: Field) => any

  /**
   * Other field types may extend the abstract field class to add more specific
   * configuration options or value restrictions. Thus they may introduce spec
   * properties on they own.
   */
  [index: string]: any
}
