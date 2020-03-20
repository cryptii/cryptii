
import BinaryFieldView from '../../views/FieldBinary'
import Chain from '../Chain'
import Field, { FieldValidationResult } from './Field'
import FieldSpec from './FieldSpec'
import Random from '../Random'

/**
 * Enum field specification type
 */
export type BinaryFieldSpec = FieldSpec & {
  /**
   * Minimum binary size in bytes. Not limited by default.
   */
  minSize?: number

  /**
   * Bit padding of minimum binary size
   */
  minSizePadding: number

  /**
   * Maximum binary size in bytes. Not limited by default.
   */
  maxSize?: number

  /**
   * Bit padding of maximum binary size
   */
  maxSizePadding: number

  /**
   * Number of bytes to produce upon randomization request. Randomly chosen
   * between minSize and maxSize by default if both values are set.
   */
  randomizationSize?: number

  /**
   * Bit padding of randomization binary size
   */
  randomizationSizePadding: number
}

/**
 * Binary field
 */
export default class BinaryField extends Field {
  /**
   * React component this model is represented by
   */
  viewComponent = BinaryFieldView

  /**
   * Minimum binary size in bytes.
   */
  private minSize?: number

  /**
   * Bit padding of minimum binary size.
   */
  private minSizePadding: number = 0

  /**
   * Maximum binary size in bytes
   */
  private maxSize?: number

  /**
   * Bit padding of maximum binary size
   */
  private maxSizePadding: number = 0

  /**
   * Number of bytes to produce upon randomization request
   */
  private randomizationSize?: number

  /**
   * Bit padding of randomization binary size
   */
  private randomizationSizePadding: number = 0

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: BinaryFieldSpec) {
    super(spec)
    this.minSize = spec.minSize
    this.minSizePadding = spec.minSizePadding || 0
    this.maxSize = spec.maxSize
    this.maxSizePadding = spec.maxSizePadding || 0
    this.randomizationSize = spec.randomizationSize
    this.randomizationSizePadding = spec.randomizationSizePadding || 0
  }

  /**
   * Minimum binary size in bytes
   */
  getMinSize (): number | undefined {
    return this.minSize
  }

  /**
   * Sets the minimum binary size in bytes
   * @param minSize
   */
  setMinSize (minSize: number | undefined) {
    this.minSize = minSize
    this.revalidateValue()
  }

  /**
   * Bit padding of minimum binary size
   */
  getMinSizePadding (): number {
    return this.minSizePadding
  }

  /**
   * Sets the bit padding of minimum binary size
   * @param minSizePadding
   */
  setMinSizePadding (minSizePadding: number | undefined) {
    this.minSizePadding = minSizePadding || 0
    this.revalidateValue()
  }

  /**
   * Maximum binary size in bytes
   */
  getMaxSize (): number | undefined {
    return this.maxSize
  }

  /**
   * Sets the maximum binary size in bytes
   * @param maxSize
   */
  setMaxSize (maxSize: number | undefined) {
    this.maxSize = maxSize
    this.revalidateValue()
  }

  /**
   * Bit padding of maximum binary size
   */
  getMaxSizePadding (): number {
    return this.maxSizePadding
  }

  /**
   * Sets the bit padding of maximum binary size
   * @param maxSizePadding
   */
  setMaxSizePadding (maxSizePadding: number | undefined) {
    this.maxSizePadding = maxSizePadding || 0
    this.revalidateValue()
  }

  /**
   * Number of bytes to produce upon randomization request
   */
  getRandomizationSize (): number | undefined {
    return this.randomizationSize
  }

  /**
   * Sets the number of bytes to produce upon randomization request
   * @param randomizationSize
   */
  setRandomizationSize (randomizationSize: number | undefined) {
    this.randomizationSize = randomizationSize
  }

  /**
   * Bit padding of randomization binary size
   */
  getRandomizationSizePadding (): number {
    return this.randomizationSizePadding
  }

  /**
   * Sets the bit padding of randomization binary size
   * @param randomizationSizePadding
   */
  setRandomizationSizePadding (randomizationSizePadding: number | undefined) {
    this.randomizationSizePadding = randomizationSizePadding || 0
  }

  /**
   * Validates the given value.
   * @param value - Value to be validated
   * @returns True, if value is valid. If it is considered invalid either a
   * validation result object or false is returned.
   */
  validateValue (value: any): boolean | FieldValidationResult {
    // Try to create Chain object from value
    let chain: Chain
    try {
      chain = Chain.from(value)
    } catch (exception) {
      return {
        key: 'binaryUnexpectedValue',
        message: 'Value must be wrappable inside a Chain object'
      }
    }

    // Measure value size
    const size = chain.getSize()
    const padding = chain.getPadding()

    // Validate minimum binary size
    if (this.minSize !== undefined && (
      size < this.minSize ||
      (size === this.minSize && padding < this.minSizePadding)
    )) {
      return {
        key: 'binarySizeTooShort',
        message:
          this.minSizePadding === 0
          ? `Value must be at least ${this.minSize} bytes long.`
          : `Value must be at least ${this.minSize} bytes and ` +
            `${this.minSizePadding} bits long.`
      }
    }

    // Validate maximum binary size
    if (this.maxSize !== undefined && (
      size > this.maxSize ||
      (size === this.maxSize && padding > this.maxSizePadding)
    )) {
      return {
        key: 'binarySizeTooLong',
        message:
          this.maxSizePadding === 0
          ? `Value must not exceed ${this.maxSize} bytes.`
          : `Value must not exceed ${this.maxSize} bytes and ` +
            `${this.maxSizePadding} bits.`
      }
    }

    return super.validateValue(value)
  }

  /**
   * Filters the given value.
   * @param value - Value to be filtered
   * @returns Filtered value
   */
  filterValue (value: any): Chain {
    return Chain.from(super.filterValue(Chain.from(value)))
  }

  /**
   * Returns a randomly chosen value or undefined if not applicable.
   * @param random - Random number generator
   * @returns Randomly chosen value for this field
   */
  randomizeValue (random: Random): Chain | undefined {
    const value = super.randomizeValue(random)
    if (value !== undefined) {
      return value
    }
    if (this.randomizationSize !== undefined) {
      // Use randomize size
      return Chain.from(
        random.nextBytes(this.randomizationSize),
        this.randomizationSizePadding)
    } else if (this.minSize !== undefined) {
      // Use the min size
      return Chain.from(
        random.nextBytes(this.minSize),
        this.minSizePadding)
    } else if (this.isValid()) {
      // Use the current value's size to
      // produce the same amount of random bytes
      return Chain.from(
        random.nextBytes(this.getValue().getSize()),
        this.getValue().getPadding()
      )
    }
    return undefined
  }

  /**
   * Serializes the field value to a JSON serializable value.
   * @throws If field value is invalid.
   * @throws If serialization is not possible.
   * @returns Serialized data
   */
  serializeValue (): any {
    if (!this.isValid()) {
      throw new Error(`Invalid field values can't be serialized.`)
    }
    return this.getValue().serialize()
  }

  /**
   * Extracts a value serialized by {@link Field.serializeValue} and returns it.
   * @param data - Serialized data
   * @return Extracted value
   */
  extractValue (data: any): any {
    return Chain.extract(data)
  }
}
