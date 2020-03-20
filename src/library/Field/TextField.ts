
import ArrayUtil from '../Util/ArrayUtil'
import Chain from '../Chain'
import MarkedChain from '../MarkedChain'
import Field, { FieldValidationResult } from './Field'
import FieldSpec from './FieldSpec'
import Random from '../Random'
import TextFieldView from '../../views/FieldText'

/**
 * Text field specification type
 */
export type TextFieldSpec = FieldSpec & {
  /**
   * Minimum number of characters. Not limited by default.
   */
  minLength?: number

  /**
   * Maximum number of characters. Not limited by default.
   */
  maxLength?: number

  /**
   * Restricts the value to the given set of Unicode characters.
   * Not limited by default.
   */
  whitelistChars?: number[] | string

  /**
   * Forbids the given set of Unicode characters in the value.
   * Not limited by default.
   */
  blacklistChars?: number[] | string

  /**
   * Restricts the value to only contain unique characters.
   * Not limited by default.
   */
  uniqueChars?: boolean

  /**
   * Wether to respect case sensitivity. Defaults to true.
   */
  caseSensitivity?: boolean
}

/**
 * Text field
 */
export default class TextField extends Field {
  /**
   * React component this model is represented by
   */
  protected viewComponent = TextFieldView

  /**
   * Minimum number of characters
   */
  private minLength?: number

  /**
   * Maximum number of characters
   */
  private maxLength?: number

  /**
   * Restricts the value to the given set of Unicode characters
   */
  private whitelistChars?: number[]

  /**
   * Forbids the given set of Unicode characters in the value
   */
  private blacklistChars?: number[]

  /**
   * Restricts the value to only contain unique characters
   */
  private uniqueChars: boolean

  /**
   * Wether to respect case sensitivity
   */
  private caseSensitivity: boolean

  /**
   * Constructor
   * @param spec - Field spec
   */
  constructor (spec: TextFieldSpec) {
    super(spec)
    this.minLength = spec.minLength
    this.maxLength = spec.maxLength
    this.whitelistChars = spec.whitelistChars !== undefined
      ? Chain.from(spec.whitelistChars).getCodePoints()
      : undefined
    this.blacklistChars = spec.blacklistChars !== undefined
      ? Chain.from(spec.blacklistChars).getCodePoints()
      : undefined
    this.uniqueChars = spec.uniqueChars || false
    this.caseSensitivity = spec.caseSensitivity || true
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    const result = this.getValidationResult()
    return {
      ...super.compose(),
      // Invalid values may be of type string
      value: this.getValue().toString(),
      markedValue: result !== undefined && result.markedChain !== undefined
        ? result.markedChain.render()
        : undefined,
      onChange: this.setValue.bind(this)
    }
  }

  /**
   * Minimum number of characters
   */
  getMinLength (): number | undefined {
    return this.minLength
  }

  /**
   * Minimum number of characters
   * @param minLength
   */
  setMinLength (minLength: number | undefined) {
    this.minLength = minLength
    this.revalidateValue()
  }

  /**
   * Maximum number of characters
   */
  getMaxLength (): number | undefined {
    return this.maxLength
  }

  /**
   * Maximum number of characters
   * @param maxLength
   */
  setMaxLength (maxLength: number | undefined) {
    this.maxLength = maxLength
    this.revalidateValue()
  }

  /**
   * Restricts the value to the given set of Unicode characters
   */
  getWhitelistChars (): number[] | undefined {
    return this.whitelistChars
  }

  /**
   * Restricts the value to the given set of Unicode characters
   * @param whitelistChars
   */
  setWhitelistChars (whitelistChars: number[] | undefined) {
    this.whitelistChars = whitelistChars
    this.revalidateValue()
  }

  /**
   * Forbids the given set of Unicode characters in the value
   */
  getBlacklistChars (): number[] | undefined {
    return this.blacklistChars
  }

  /**
   * Forbids the given set of Unicode characters in the value
   * @param blacklistChars
   */
  setBlacklistChars (blacklistChars: number[] | undefined) {
    this.blacklistChars = blacklistChars
    this.revalidateValue()
  }

  /**
   * Restricts the value to only contain unique characters
   */
  getUniqueChars (): boolean {
    return this.uniqueChars
  }

  /**
   * Restricts the value to only contain unique characters
   * @param uniqueChars
   */
  setUniqueChars (uniqueChars: boolean) {
    this.uniqueChars = uniqueChars
    this.revalidateValue()
  }

  /**
   * Wether to respect case sensitivity
   */
  getCaseSensitivity (): boolean {
    return this.caseSensitivity
  }

  /**
   * Wether to respect case sensitivity
   * @param caseSensitivity
   */
  setCaseSensitivity (caseSensitivity: boolean) {
    this.caseSensitivity = caseSensitivity
    if (this.isValid()) {
      this.setValue(this.getValue().toLowerCase())
    } else {
      this.revalidateValue()
    }
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
        key: 'textUnexpectedValue',
        message: 'Value must be wrappable inside a Chain object'
      }
    }

    let key: string | undefined = undefined
    let message: string | undefined = undefined
    const length = chain.getLength()
    const markedChain = new MarkedChain(chain)

    // Validate min text length
    if (this.minLength !== undefined && length < this.minLength) {
      key = 'textLengthTooShort'
      message =
        `The value must be at least ${this.minLength} ` +
        `${this.minLength === 1 ? 'character' : 'characters'} long`
    }

    // Validate max text length
    if (this.maxLength !== undefined && length > this.maxLength) {
      key = 'textLengthTooLong'
      message =
        `The value must not exceed ${this.maxLength} ` +
        `${this.maxLength === 1 ? 'character' : 'characters'} in length`

      // Mark the part being too long
      markedChain.mark(this.maxLength, length, 'error')
    }

    // Validate character whitelist, blacklist and character uniqueness
    if (this.whitelistChars !== undefined ||
        this.blacklistChars !== undefined ||
        this.uniqueChars
    ) {
      const whitelist = this.whitelistChars
      const blacklist = this.blacklistChars
      const codePoints = chain.getCodePoints()

      // Go through code points and collect forbidden or duplicate chars
      let containsForbiddenChars = false
      let containsDuplicateChars = false
      let c
      for (let i = 0; i < length; i++) {
        c = codePoints[i]
        if ((whitelist !== undefined && whitelist.indexOf(c) === -1) ||
            (blacklist !== undefined && blacklist.indexOf(c) !== -1)) {
          // Found forbidden character
          containsForbiddenChars = true
          markedChain.mark(i, i + 1, 'error')
        } else if (this.uniqueChars && codePoints.indexOf(c) !== i) {
          // Found duplicate character
          containsDuplicateChars = true
          markedChain.mark(i, i + 1, 'error')
        }
      }

      if (containsForbiddenChars) {
        key = 'textForbiddenCharacter'
        message = 'The value contains forbidden characters'
      } else if (containsDuplicateChars) {
        key = 'textCharactersNotUnique'
        message = 'The value contains duplicate characters'
      }
    }

    if (key !== undefined) {
      return { key, message, markedChain }
    }

    return super.validateValue(chain)
  }

  /**
   * Filters the given value.
   * @param value - Value to be filtered
   * @returns Filtered value
   */
  filterValue (value: any): Chain {
    let chain = Chain.from(value)
    if (!this.caseSensitivity) {
      chain = chain.toLowerCase()
    }
    return Chain.from(super.filterValue(chain))
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
    if (this.isValid()) {
      if (this.uniqueChars) {
        // Shuffle the characters of the current value
        const codePoints = this.getValue().getCodePoints()
        return Chain.from(random.nextShuffle(codePoints))
      } else if (this.whitelistChars !== undefined) {
        // Use the current value's length to
        // produce the same amount of random chars
        const length = this.getValue().getLength()
        const codePoints = []
        for (let i = 0; i < length; i++) {
          codePoints.push(random.nextElement(this.whitelistChars))
        }
        return Chain.from(codePoints)
      }
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
