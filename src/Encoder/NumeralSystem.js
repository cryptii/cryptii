import Encoder from '../Encoder.js'
import StringUtil from '../StringUtil.js'
import InvalidInputError from '../Error/InvalidInput.js'

const meta = {
  name: 'numeral-system',
  title: 'Numeral system',
  category: 'Transform',
  type: 'encoder'
}

const systemNames = [
  'binary',
  'octal',
  'decimal',
  'hexadecimal',
  'roman-numerals'
]

const systemLabels = [
  'Binary (2)',
  'Octal (8)',
  'Decimal (10)',
  'Hexadecimal (16)',
  'Roman numerals'
]

const systemPatterns = [
  /([01]+)/g,
  /([0-7]+)/g,
  /(\d+)/g,
  /([0-9a-f]+)/gi,
  /([IVXLCDM]+)/gi
]

const romanNumeralSymbols = [
  'M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']

const romanNumeralValues = [
  1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]

/**
 * Encoder brick translating numerals between systems.
 */
export default class NumeralSystemEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSettings([
      {
        name: 'from',
        label: 'Read',
        type: 'enum',
        value: 'decimal',
        elements: systemNames,
        labels: systemLabels,
        randomizable: false,
        style: 'radio'
      },
      {
        name: 'to',
        label: 'Convert to',
        type: 'enum',
        value: 'hexadecimal',
        elements: systemNames,
        labels: systemLabels,
        randomizable: false,
        style: 'radio'
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const string = content.toString()
    const from = this.getSettingValue(isEncode ? 'from' : 'to')
    const to = this.getSettingValue(isEncode ? 'to' : 'from')

    const pattern = systemPatterns[systemNames.indexOf(from)]

    // Find numbers using pattern
    const result = string.replace(pattern, (match, rawNumber, offset) => {
      const alone =
        (offset === 0 || StringUtil.isWhitespace(string, offset - 1)) &&
        (string.length === offset + rawNumber.length ||
          StringUtil.isWhitespace(string, offset + rawNumber.length))

      if (!alone) {
        // Ignore numbers having adjacent characters
        return rawNumber
      }

      const decimal = NumeralSystemEncoder.decodeNumber(from, rawNumber)
      const encodedValue = decimal !== null
        ? NumeralSystemEncoder.encodeNumber(to, decimal)
        : null
      return encodedValue || rawNumber
    })

    return result
  }

  /**
   * Translates number from given system to decimal.
   * @protected
   * @param {string} type Numeral system to translate from
   * @param {string} string String representation
   * @return {Number|BigInt|null} Number, BigInt or null, if not defined
   */
  static decodeNumber (type, string) {
    // If BigInt is available, use it to treat arbitrarily large integers
    if (typeof BigInt !== 'undefined') {
      // See https://github.com/tc39/proposal-bigint/issues/86#issuecomment-348317283
      switch (type) {
        case 'binary':
          return BigInt(`0b${string}`)
        case 'octal':
          return BigInt(`0o${string}`)
        case 'decimal':
          return BigInt(string)
        case 'hexadecimal':
          return BigInt(`0x${string}`)
      }
    }

    // Fallback to limited JavaScript Numbers
    let number = null
    switch (type) {
      case 'binary':
        number = parseInt(string, 2)
        break
      case 'octal':
        number = parseInt(string, 8)
        break
      case 'decimal':
        number = parseInt(string, 10)
        break
      case 'hexadecimal':
        number = parseInt(string, 16)
        break
      case 'roman-numerals':
        number = NumeralSystemEncoder.romanNumeralsToDecimal(string)
        break
    }

    // Check for successful
    if (number === null || isNaN(number)) {
      return null
    }

    // Validate Number limits
    if (!NumeralSystemEncoder.isSafeInteger(number)) {
      throw new InvalidInputError(
        `Can't read '${string}' because the current environment does not ` +
        'support arbitrarily large integers.')
    }

    return number
  }

  /**
   * Exports number in the given system.
   * @protected
   * @param {string} system Numeral system to translate to
   * @param {Number|BigInt} number
   * @return {?string} Number string or null, if not defined
   */
  static encodeNumber (type, number) {
    switch (type) {
      case 'binary':
        return number.toString(2)
      case 'octal':
        return number.toString(8)
      case 'decimal':
        return number.toString(10)
      case 'hexadecimal':
        return number.toString(16)
      case 'roman-numerals':
        return NumeralSystemEncoder.decimalToRomanNumerals(number)
      default:
        return null
    }
  }

  /**
   * Determines whether the provided value is a `Number` that is a safe integer.
   * @param {Number} testValue
   * @return {Boolean}
   */
  static isSafeInteger (testValue) {
    if (Number.isSafeInteger === undefined) {
      const maxInteger = Number.MAX_SAFE_INTEGER || 9007199254740991
      return Number.isInteger(testValue) && Math.abs(testValue) <= maxInteger
    }
    return Number.isSafeInteger(testValue)
  }

  /**
   * Translates given decimal to roman numerals.
   * @protected
   * @param {Number|BigInt} decimal Decimal value (1-3999)
   * @return {?string} Roman numerals or null, if not defined
   */
  static decimalToRomanNumerals (decimal) {
    if (decimal <= 0 || decimal >= 4000) {
      return null
    }

    let remainder = Number(decimal)
    let romanNumerals = ''
    let numeral

    while (remainder > 0) {
      // Find highest roman numeral less or equal to the decimal
      numeral = romanNumeralValues.findIndex(value => remainder >= value)
      // Add digit
      romanNumerals += romanNumeralSymbols[numeral]
      // Substract roman mumeral from remainder
      remainder -= romanNumeralValues[numeral]
    }

    return romanNumerals
  }

  /**
   * Translates given roman numerals to decimal.
   * @protected
   * @param {string} romanNumerals
   * @return {?number} Decimal or null, if not defined.
   */
  static romanNumeralsToDecimal (romanNumerals) {
    romanNumerals = romanNumerals.toString().toUpperCase()

    let index = 0
    let decimal = 0
    let error = false

    let previousNumeral = 0
    let numeral

    while (!error && index < romanNumerals.length) {
      // Find first roman numeral with the highest value
      numeral = romanNumeralSymbols.findIndex(symbol =>
        romanNumerals.substr(index, symbol.length) === symbol)

      if (numeral !== -1 && numeral >= previousNumeral) {
        // Append roman numeral
        decimal += romanNumeralValues[numeral]
        // Move cursor
        index += romanNumeralSymbols[numeral].length
        // Track previous numeral
        previousNumeral = numeral
      } else {
        // Unexpected numeral
        error = true
      }
    }

    return !error ? decimal : null
  }
}
