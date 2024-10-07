import ArrayUtil from '../ArrayUtil.js'
import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'

const meta = {
  name: 'polybius-square',
  title: 'Polybius square',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * Encoder brick for Polybius square encoding and decoding
 */
export default class PolybiusSquareEncoder extends Encoder {
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
        name: 'alphabet',
        type: 'text',
        value: 'abcdefghiklmnopqrstuvwxyz',
        uniqueChars: true,
        minLength: 2,
        validateValue: this.validateAlphabetValue.bind(this),
        caseSensitivity: false
      },
      {
        name: 'rows',
        type: 'text',
        value: '12345',
        uniqueChars: true,
        minLength: 2,
        width: 6,
        randomizable: false,
        caseSensitivity: false
      },
      {
        name: 'columns',
        type: 'text',
        value: '12345',
        uniqueChars: true,
        minLength: 2,
        width: 6,
        randomizable: false,
        caseSensitivity: false
      },
      {
        name: 'separator',
        type: 'text',
        value: '',
        randomizable: false,
        caseSensitivity: false,
        validateValue: this.validateSeparatorValue.bind(this)
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        width: 6,
        value: false,
        randomizable: false
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        label: 'Foreign Chars',
        width: 6,
        value: false,
        randomizable: false,
        trueLabel: 'Include',
        falseLabel: 'Ignore'
      }
    ])
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Filtered content
   */
  willTranslate (content, isEncode) {
    // Lowercase content if case sensitivity is set to false
    if (!this.getSettingValue('caseSensitivity')) {
      content = content.toLowerCase()
    }
    if (isEncode) {
      // Standard Polybius square does not distinguish between 'i' and 'j'
      // Replace all 'j' chars by 'i', if only 'i' is part of the alphabet
      const alphabet = this.getSettingValue('alphabet').getCodePoints()
      if (alphabet.indexOf(105) !== -1 && alphabet.indexOf(106) === -1) {
        content = content.getString().replace(/j/g, 'i')
      }
    }
    return content
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  performEncode (content) {
    const alphabet = this.getSettingValue('alphabet').getCodePoints()
    const separator = this.getSettingValue('separator').getCodePoints()
    const includeForeignChars = this.getSettingValue('includeForeignChars')

    const rows = this.getSettingValue('rows').getCodePoints()
    const columns = this.getSettingValue('columns').getCodePoints()

    const width = columns.length
    const input = content.getCodePoints()
    const separatorLength = separator.length
    const inputLength = input.length

    // Create a fixed-size array with the maximum number of result elements
    const result = new Array(inputLength * (separatorLength + 2))

    let codePoint, index, k
    let j = 0
    let isForeignPart = false

    for (let i = 0; i < inputLength; i++) {
      codePoint = input[i]
      index = alphabet.indexOf(codePoint)

      // Add separator
      if (j > 0 && (index !== -1 || (includeForeignChars && !isForeignPart))) {
        for (k = 0; k < separatorLength; k++) {
          result[j++] = separator[k]
        }
      }

      isForeignPart = false

      if (index !== -1) {
        // Encode Polybius square coordinates
        result[j++] = rows[Math.floor(index / width)]
        result[j++] = columns[index % width]
      } else if (includeForeignChars) {
        // Add foreign character
        result[j++] = codePoint
        isForeignPart = true
      }
    }

    return result.slice(0, j)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    const alphabet = this.getSettingValue('alphabet').getCodePoints()
    const separator = this.getSettingValue('separator').getCodePoints()
    const includeForeignChars = this.getSettingValue('includeForeignChars')

    const rows = this.getSettingValue('rows').getCodePoints()
    const columns = this.getSettingValue('columns').getCodePoints()

    // Ignore all separators inside the given content
    const input = ArrayUtil.replaceSlice(content.getCodePoints(), separator)

    const alphabetLength = alphabet.length
    const width = columns.length
    const inputLength = input.length
    const result = new Array(inputLength)

    let i = 0
    let j = 0
    let row, column, index

    while (i < inputLength) {
      // Find the next valid row character
      row = null
      while (row === null && i < inputLength) {
        index = rows.indexOf(input[i])
        if (index !== -1) {
          // Found row character
          row = index
        } else if (includeForeignChars) {
          // Include foreign character
          result[j++] = input[i]
        }
        i++
      }

      // Find the next valid column character
      column = null
      while (column === null && i < inputLength) {
        index = rows.indexOf(input[i])
        if (index !== -1) {
          // Found column character
          column = index
        } else if (includeForeignChars) {
          // Include foreign character
          result[j++] = input[i]
        }
        i++
      }

      if (row !== null && column !== null) {
        // Decode square coordinates
        index = row * width + column

        // Make sure the given square cell is defined by the alphabet
        if (index >= alphabetLength) {
          throw new InvalidInputError(
            `Polybius square cell at coordinates ${row},${column} are not ` +
            'defined by the alphabet.')
        }

        result[j++] = alphabet[index]
      } else if (row !== null || column !== null) {
        // Incomplete set of coordinates
        throw new InvalidInputError(
          'Reached unexpected end of content. The last set of Polybius ' +
          'square coordinates is incomplete.')
      }
    }

    return result.slice(0, j)
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'caseSensitivity':
        this.getSetting('alphabet').setCaseSensitivity(value)
        this.getSetting('rows').setCaseSensitivity(value)
        this.getSetting('columns').setCaseSensitivity(value)
        this.getSetting('separator').setCaseSensitivity(value)
        break
      case 'columns':
      case 'rows':
        this.getSetting('alphabet').revalidateValue()
        break
    }
  }

  /**
   * Validates wether alphabet fits into the Polybius square.
   * @param {Chain} value Alphabet value
   * @param {Field} setting Sender field
   * @return {boolean|object}
   */
  validateAlphabetValue (value, setting) {
    const length = value.getLength()
    const columns = this.getSettingValue('columns').getLength()
    const rows = this.getSettingValue('rows').getLength()

    // Check if the alphabet fits inside the rows and columns
    if (length > rows * columns) {
      return {
        key: 'polybiusSquareAlphabetTooLong',
        message:
          `The alphabet size ${length} is too big for the given ` +
          `${rows}×${columns} Polybius square defined by the settings ` +
          '\'columns\' and \'rows\'.'
      }
    }

    // Check if the alphabet is long enough to reach the last row
    if (length <= (rows - 1) * columns) {
      return {
        key: 'polybiusSquareAlphabetTooShort',
        message:
          `The alphabet size ${length} is too short for the given ` +
          `${rows}×${columns} Polybius square defined by the settings ` +
          '\'columns\' and \'rows\'.'
      }
    }

    return true
  }

  /**
   * Validates the separator setting to make sure it does not contain
   * characters from the rows or the columns.
   * @param {Chain} value Separator value
   * @param {Field} setting Sender field
   * @return {boolean|object}
   */
  validateSeparatorValue (value, setting) {
    const blacklist = this.getSettingValue('rows').getCodePoints()
    blacklist.concat(this.getSettingValue('columns').getCodePoints())

    const containsInvalidCharacter = value.getCodePoints()
      .find(codePoint => blacklist.indexOf(codePoint) !== -1) !== undefined

    if (containsInvalidCharacter) {
      return {
        key: 'polybiusSquareSeparatorInvalid',
        message:
          'The separator shall not contain characters from the Polybius ' +
          'square rows or columns'
      }
    }

    return true
  }
}
