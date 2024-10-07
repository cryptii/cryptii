import Encoder from '../Encoder.js'
import StringUtil from '../StringUtil.js'
import InvalidInputError from '../Error/InvalidInput.js'

const meta = {
  name: 'morse-code',
  title: 'Morse code',
  category: 'Alphabets',
  type: 'encoder'
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789.,?\'!/()&:;=+-_"$@'
const codeAlphabet = [
  /* eslint-disable no-multi-spaces */

  // Letters: a-z
  '.-',      '-...',    '-.-.',    '-..',     '.',       '..-.',    '--.',
  '....',    '..',      '.---',    '-.-',     '.-..',    '--',      '-.',
  '---',     '.--.',    '--.-',    '.-.',     '...',     '-',       '..-',
  '...-',    '.--',     '-..-',    '-.--',    '--..',

  // Numbers: 0-9
  '-----',   '.----',   '..---',   '...--',   '....-',   '.....',   '-....',
  '--...',   '---..',   '----.',

  // Punctuation: .,?'!/()&:;=+-_"$@
  '.-.-.-',  '--..--',  '..--..',  '.----.',  '-.-.--',  '-..-.',   '-.--.',
  '-.--.-',  '.-...',   '---...',  '-.-.-.',  '-...-',   '.-.-.',   '-....-',
  '..--.-',  '.-..-.',  '..._.._', '.--.-.'

  /* eslint-enable no-multi-spaces */
]

/**
 * Encoder brick for morse code encoding and decoding
 */
export default class MorseCodeEncoder extends Encoder {
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
        name: 'variant',
        type: 'enum',
        value: 'english',
        elements: ['english'],
        labels: ['English'],
        randomizable: false
      },
      {
        name: 'representation',
        type: 'enum',
        value: 'code',
        elements: ['code', 'timing'],
        labels: ['Code', 'Timing'],
        randomizable: false
      },
      {
        name: 'shortMark',
        label: 'Short',
        type: 'text',
        width: 4,
        value: '.',
        minLength: 1,
        randomizable: false,
        validateValue: this.validateCodeMarkSettingValue.bind(this)
      },
      {
        name: 'longerMark',
        label: 'Long',
        type: 'text',
        width: 4,
        value: '-',
        minLength: 1,
        randomizable: false,
        validateValue: this.validateCodeMarkSettingValue.bind(this)
      },
      {
        name: 'spaceMark',
        label: 'Space',
        type: 'text',
        width: 4,
        value: '/',
        minLength: 1,
        randomizable: false,
        validateValue: this.validateCodeMarkSettingValue.bind(this)
      },
      {
        name: 'signalOnMark',
        label: 'Signal On',
        type: 'text',
        width: 6,
        visible: false,
        value: '=',
        minLength: 1,
        randomizable: false,
        validateValue: this.validateTimingMarkSettingValue.bind(this)
      },
      {
        name: 'signalOffMark',
        label: 'Signal Off',
        type: 'text',
        width: 6,
        visible: false,
        value: '.',
        minLength: 1,
        randomizable: false,
        validateValue: this.validateTimingMarkSettingValue.bind(this)
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    const representation = this.getSettingValue('representation')

    let shortMark = '.'
    let longerMark = '-'
    let spaceMark = '/'

    if (representation === 'code') {
      shortMark = this.getSettingValue('shortMark').getString()
      longerMark = this.getSettingValue('longerMark').getString()
      spaceMark = this.getSettingValue('spaceMark').getString()
    }

    let string = content.toLowerCase().getChars()
      // Encode each character
      .map(char => {
        const code = MorseCodeEncoder.encodeCharacter(
          char, shortMark, longerMark, spaceMark)

        if (code === null) {
          throw new InvalidInputError(
            `Char '${char}' is not defined in morse code`)
        }
        return code
      })
      // Glue it back together
      .join(' ')

    if (representation === 'timing') {
      // Translate to timing representation
      const signalOnMark = this.getSettingValue('signalOnMark').getString()
      const signalOffMark = this.getSettingValue('signalOffMark').getString()

      string = string
        .split('')
        .map(symbol => {
          switch (symbol) {
            // Dit
            case '.':
              return signalOnMark
            // Dah
            case '-':
              return signalOnMark.repeat(3)
            // Letter and word space
            default:
              return signalOffMark
          }
        })
        // Glue together and add symbol space
        .join(signalOffMark)
    }

    return string
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    const representation = this.getSettingValue('representation')
    let string = content.getString()

    let shortMark = '.'
    let longerMark = '-'
    let spaceMark = '/'

    if (representation === 'code') {
      shortMark = this.getSettingValue('shortMark').getString()
      longerMark = this.getSettingValue('longerMark').getString()
      spaceMark = this.getSettingValue('spaceMark').getString()
    }

    if (representation === 'timing') {
      // Interpret timing code
      const fromMarks = [
        this.getSettingValue('signalOnMark').getString(),
        this.getSettingValue('signalOffMark').getString()]

      string = MorseCodeEncoder.translateMarks(
        string, fromMarks, ['=', '.'])

      // Translate timing code to morse code
      string = string
        .replace(/===/g, '-')
        .replace(/\.{7}/g, ' / ')
        .replace(/\.{3}/g, ' ')
        .replace(/\./g, '')
        .replace(/=/g, '.')
    }

    // Translate morse code to string
    string = string
      // Split characters by space
      .split(' ')
      // Decode each character
      .map(rawCode => {
        if (rawCode === '') {
          return null
        }

        const char = MorseCodeEncoder.decodeCode(
          rawCode, shortMark, longerMark, spaceMark)

        if (char === null) {
          throw new InvalidInputError(
            `Code '${rawCode}' is not defined in morse code`)
        }
        return char
      })
      // Leave out codes that are not defined
      .filter(char => char !== null)
      // Glue it back together
      .join('')

    return string
  }

  /**
   * Validates code mark setting value.
   * Makes sure they can be differentiated from each other.
   * @protected
   * @param {mixed} rawValue
   * @param {Setting} setting
   * @return {boolean} Returns true, if value is valid.
   */
  validateCodeMarkSettingValue (rawValue, setting) {
    const mark = setting.filterValue(rawValue)

    // Because morse code letters are separated by whitespaces they
    // are not allowed inside morse code marks
    if (mark.match(/\s/) !== null) {
      return {
        key: 'morseCodeMarkWhitespaceNotAllowed',
        message: 'Whitespaces are not allowed inside morse code marks'
      }
    }

    const equalSettingName =
      ['shortMark', 'longerMark', 'spaceMark']
        .filter(name => name !== setting.getName())
        .find(name => mark.isEqualTo(this.getSettingValue(name)))

    if (equalSettingName !== undefined) {
      return {
        key: 'morseCodeMarkNotUnique',
        message: 'Morse code marks need to be different from each other'
      }
    }

    return true
  }

  /**
   * Validates timing mark setting value.
   * Makes sure they can be differentiated from each other.
   * @protected
   * @param {mixed} rawValue
   * @param {Setting} setting
   * @return {boolean} Returns true, if value is valid.
   */
  validateTimingMarkSettingValue (rawValue, setting) {
    const mark = setting.filterValue(rawValue)
    const equalSettingName =
      ['signalOnMark', 'signalOffMark']
        .filter(name => name !== setting.getName())
        .find(name => mark.indexOf(this.getSettingValue(name)) === 0)

    if (equalSettingName !== undefined) {
      return {
        key: 'morseCodeMarkNotUnique',
        message: 'Timing marks need to be different from each other'
      }
    }

    return true
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'shortMark':
      case 'longerMark':
      case 'spaceMark':
        // Revalidate other settings
        ;['shortMark', 'longerMark', 'spaceMark']
          .filter(name => name !== setting.getName())
          .forEach(name => this.getSetting(name).revalidateValue())
        break
      case 'signalOnMark':
      case 'signalOffMark':
        // Revalidate other settings
        ;['signalOnMark', 'signalOffMark']
          .filter(name => name !== setting.getName())
          .forEach(name => this.getSetting(name).revalidateValue())
        break
      case 'representation':
        // Show & hide fields for given representation
        this.getSetting('shortMark').setVisible(value === 'code')
        this.getSetting('longerMark').setVisible(value === 'code')
        this.getSetting('spaceMark').setVisible(value === 'code')
        this.getSetting('signalOnMark').setVisible(value === 'timing')
        this.getSetting('signalOffMark').setVisible(value === 'timing')
        break
    }
  }

  /**
   * Encodes given character to its morse code representation.
   * @protected
   * @param {string} char Character to be encoded.
   * @param {string} shortMark
   * @param {string} longerMark
   * @param {string} spaceMark
   * @return {?string} Morse code representation or null, if not defined.
   */
  static encodeCharacter (char, shortMark, longerMark, spaceMark) {
    // Handle space
    if (StringUtil.isWhitespace(char)) {
      return spaceMark
    }

    // Find char in alphabet
    const index = alphabet.indexOf(char)
    if (index === -1) {
      // Char is not defined
      return null
    }

    // Translate marks
    const code = codeAlphabet[index]
    return MorseCodeEncoder.translateMarks(
      code, ['.', '-'], [shortMark, longerMark])
  }

  /**
   * Decodes given code to its character representation.
   * @protected
   * @param {string} rawCode Morse code unit
   * @param {string} shortMark
   * @param {string} longerMark
   * @param {string} spaceMark
   * @return {?string} Character or null, if not defined.
   */
  static decodeCode (rawCode, shortMark, longerMark, spaceMark) {
    // Handle space
    if (rawCode === spaceMark) {
      return ' '
    }

    // Translate marks
    const code = MorseCodeEncoder.translateMarks(
      rawCode, [shortMark, longerMark], ['.', '-'])

    // Find code in alphabet
    const index = codeAlphabet.indexOf(code)
    return index !== -1 ? alphabet[index] : null
  }

  /**
   * Runs from start to end through the string and replaces marks.
   * Removes parts that can't be recognized.
   * @protected
   * @param {string} string
   * @param {string[]} fromMarks
   * @param {string[]} toMarks
   * @return {string}
   */
  static translateMarks (string, fromMarks, toMarks) {
    let result = ''
    let i = -1
    let j, mark, markRecognized

    // Go through string
    while (++i < string.length) {
      markRecognized = false
      j = -1

      // Find a mark that needs replacement
      while (!markRecognized && ++j < fromMarks.length) {
        mark = fromMarks[j]
        markRecognized = string.substr(i, mark.length) === mark

        if (markRecognized) {
          // Append replacement mark to haystack
          result += toMarks[j]
          i += mark.length - 1
        }
      }
    }

    return result
  }
}
