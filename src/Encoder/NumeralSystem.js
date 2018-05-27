
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'

const meta = {
  name: 'numeral-system',
  title: 'Numeral system',
  category: 'Transform',
  type: 'encoder'
}

const systemNames = [
  'decimal',
  'binary',
  'octal',
  'hexadecimal',
  'roman-numerals'
]

const systemLabels = [
  'Decimal',
  'Binary',
  'Octal',
  'Hexadecimal',
  'Roman numerals'
]

const systemPatterns = [
  /(\d+)/g,
  /([01]+)/g,
  /([0-7]+)/g,
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
   * Brick constructor
   */
  constructor () {
    super()
    this.registerSetting([
      {
        name: 'from',
        label: 'Read',
        type: 'enum',
        value: 'decimal',
        randomizable: false,
        style: 'radio',
        options: {
          elements: systemNames,
          labels: systemLabels
        }
      },
      {
        name: 'to',
        label: 'Convert to',
        type: 'enum',
        value: 'roman-numerals',
        randomizable: false,
        style: 'radio',
        options: {
          elements: systemNames,
          labels: systemLabels
        }
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const string = content.toString()
    const from = this.getSettingValue(isEncode ? 'from' : 'to')
    const to = this.getSettingValue(isEncode ? 'to' : 'from')

    const pattern = systemPatterns[systemNames.indexOf(from)]

    // find numbers using pattern
    return string.replace(pattern, (match, rawNumber, offset) => {
      const alone =
        (offset === 0 || StringUtil.isWhitespace(string, offset - 1)) &&
        (string.length === offset + rawNumber.length ||
          StringUtil.isWhitespace(string, offset + rawNumber.length))

      if (!alone) {
        // ignore numbers having adjacent characters
        return rawNumber
      }

      const decimal = NumeralSystemEncoder.decodeNumber(from, rawNumber)
      const encodedValue = decimal !== null
        ? NumeralSystemEncoder.encodeNumber(to, decimal)
        : null
      return encodedValue || rawNumber
    })
  }

  /**
   * Translates number from given system to decimal.
   * @protected
   * @param {string} system Numeral system to translate from
   * @param {string} rawNumber
   * @return {?number} Decimal or null, if not defined
   */
  static decodeNumber (system, rawNumber) {
    let decimal = null
    switch (system) {
      case 'decimal':
        decimal = parseInt(rawNumber, 10)
        break
      case 'binary':
        decimal = parseInt(rawNumber, 2)
        break
      case 'octal':
        decimal = parseInt(rawNumber, 8)
        break
      case 'hexadecimal':
        decimal = parseInt(rawNumber, 16)
        break
      case 'roman-numerals':
        decimal = NumeralSystemEncoder.romanNumeralsToDecimal(rawNumber)
        break
    }
    return decimal !== null && !isNaN(decimal) ? decimal : null
  }

  /**
   * Translates number from decimal to given system.
   * @protected
   * @param {string} system Numeral system to translate to
   * @param {number} decimal
   * @return {?string} Number or null, if not defined
   */
  static encodeNumber (system, decimal) {
    switch (system) {
      case 'binary':
        return decimal.toString(2)
      case 'octal':
        return decimal.toString(8)
      case 'hexadecimal':
        return decimal.toString(16)
      case 'roman-numerals':
        return NumeralSystemEncoder.decimalToRomanNumerals(decimal)
    }
    return decimal
  }

  /**
   * Translates given decimal to roman numerals.
   * @protected
   * @param {number} decimal Decimal value (1-3999)
   * @return {?string} Roman numerals or null, if not defined
   */
  static decimalToRomanNumerals (decimal) {
    if (decimal <= 0 || decimal >= 4000) {
      return null
    }

    let remainder = decimal
    let romanNumerals = ''
    let numeral

    while (remainder > 0) {
      // find highest roman numeral less or equal to the decimal
      numeral = romanNumeralValues.findIndex(value => remainder >= value)
      // add digit
      romanNumerals += romanNumeralSymbols[numeral]
      // substract roman mumeral from remainder
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
      // find first roman numeral with the highest value
      numeral = romanNumeralSymbols.findIndex(symbol =>
        romanNumerals.substr(index, symbol.length) === symbol)

      if (numeral !== -1 && numeral >= previousNumeral) {
        // append roman numeral
        decimal += romanNumeralValues[numeral]
        // move cursor
        index += romanNumeralSymbols[numeral].length
        // track previous numeral
        previousNumeral = numeral
      } else {
        // unexpected numeral
        error = true
      }
    }

    return !error ? decimal : null
  }
}
