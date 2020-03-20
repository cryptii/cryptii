
import Field, { FieldValidationResult } from './Field'
import EnumFieldView from '../../views/FieldEnum'
import FieldSpec from './FieldSpec'
import Random from '../Random'

/**
 * Enum field element type
 */
export type EnumFieldElement = {
  /**
   * Element value
   */
  value: any

  /**
   * Element label
   */
  label?: string

  /**
   * Element description
   */
  description?: string
}

/**
 * Enum field specification type
 */
export type EnumFieldSpec = FieldSpec & {
  /**
   * Array of enum elements
   */
  elements: EnumFieldElement[]
}

/**
 * Enum field
 */
export default class EnumField extends Field {
  /**
   * React component this model is represented by
   */
  protected viewComponent = EnumFieldView

  /**
   * Array of enum elements
   */
  private elements: EnumFieldElement[]

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: EnumFieldSpec) {
    super(spec)
    this.elements = spec.elements
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      ...super.compose(),
      index: this.getSelectedIndex(),
      labels: this.elements.map(el => el.label || el.value.toString()),
      onChange: this.setSelectedIndex.bind(this)
    }
  }

  /**
   * Array of enum elements
   */
  getElements(): EnumFieldElement[] {
    return this.elements
  }

  /**
   * Array of enum elements
   * @param elements
   */
  setElements(elements: EnumFieldElement[]) {
    this.elements = elements
    // TODO: Choose a different value if the current one is no longer valid
    this.revalidateValue()
  }

  /**
   * Current selected index
   */
  getSelectedIndex(): number {
    return this.elements.findIndex(el => el.value === this.getValue())
  }

  /**
   * Current selected index
   * @param selectedIndex
   */
  setSelectedIndex(selectedIndex: number) {
    this.setValue(this.elements[selectedIndex].value)
  }

  /**
   * Validates the given value.
   * @param value - Value to be validated
   * @returns True, if value is valid. If it is considered invalid either a
   * validation result object or false is returned.
   */
  validateValue (value: any): boolean | FieldValidationResult {
    if (this.elements.find(element => element.value === value) === undefined) {
      const description = this.elements.map(element => element.label).join(', ')
      return {
        key: 'enumNotInHaystack',
        message: `The value must be part of the enum (${description})`
      }
    }
    return super.validateValue(value)
  }

  /**
   * Returns a randomly chosen value or undefined if not applicable.
   * @param random - Random number generator
   * @returns Randomly chosen value for this field
   */
  randomizeValue (random: Random): any | undefined {
    const value = super.randomizeValue(random)
    if (value !== undefined) {
      return value
    }
    return random.nextElement(this.elements).value
  }
}
