
import Chain from '../Chain'
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'
import InvalidInputError from '../Error/InvalidInput'

const meta = {
  name: 'morse-code',
  title: 'Morse code',
  category: 'Encoding',
  type: 'encoder'
}

let alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789.,?\'!/()&:;=+-_"$@'
let codeAlphabet = [
  /* eslint-disable no-multi-spaces */

  // letters: a-z
  '.-',      '-...',    '-.-.',    '-..',     '.',       '..-.',    '--.',
  '....',    '..',      '.---',    '-.-',     '.-..',    '--',      '-.',
  '---',     '.--.',    '--.-',    '.-.',     '...',     '-',       '..-',
  '...-',    '.--',     '-..-',    '-.--',    '--..',

  // numbers: 0-9
  '-----',   '.----',   '..---',   '...--',   '....-',   '.....',   '-....',
  '--...',   '---..',   '----.',

  // punctuation: .,?'!/()&:;=+-_"$@
  '.-.-.-',  '--..--',  '..--..',  '.----.',  '-.-.--',  '-..-.',   '-.--.',
  '-.--.-',  '.-...',   '---...',  '-.-.-.',  '-...-',   '.-.-.',   '-....-',
  '..--.-',  '.-..-.',  '..._.._', '.--.-.'

  /* eslint-enable no-multi-spaces */
]

/**
 * Encoder Brick for morse code encoding and decoding.
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
   * Brick constructor
   */
  constructor () {
    super()
    this.registerSetting([
      {
        name: 'variant',
        type: 'enum',
        value: 'english',
        randomizable: false,
        options: {
          elements: [
            'english'
          ],
          labels: [
            'English'
          ]
        }
      },
      {
        name: 'representation',
        type: 'enum',
        value: 'code',
        randomizable: false,
        options: {
          elements: [
            'code',
            'timing'
          ],
          labels: [
            'Code',
            'Timing'
          ]
        }
      },
      {
        name: 'shortMark',
        label: 'Short',
        type: 'text',
        width: 4,
        value: '.',
        randomizable: false,
        validateValue:
          this.validateCodeMarkSettingValue.bind(this),
        options: {
          minLength: 1
        }
      },
      {
        name: 'longerMark',
        label: 'Long',
        type: 'text',
        width: 4,
        value: '-',
        randomizable: false,
        validateValue:
          this.validateCodeMarkSettingValue.bind(this),
        options: {
          minLength: 1
        }
      },
      {
        name: 'spaceMark',
        label: 'Space',
        type: 'text',
        width: 4,
        value: '/',
        randomizable: false,
        validateValue:
          this.validateCodeMarkSettingValue.bind(this),
        options: {
          minLength: 1
        }
      },
      {
        name: 'signalOnMark',
        label: 'Signal On',
        type: 'text',
        width: 6,
        visible: false,
        value: '=',
        randomizable: false,
        validateValue:
          this.validateTimingMarkSettingValue.bind(this),
        options: {
          minLength: 1
        }
      },
      {
        name: 'signalOffMark',
        label: 'Signal Off',
        type: 'text',
        width: 6,
        visible: false,
        value: '.',
        randomizable: false,
        validateValue:
          this.validateTimingMarkSettingValue.bind(this),
        options: {
          minLength: 1
        }
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @param {Chain} content
   * @return {Chain|Promise} Encoded content
   */
  performEncode (content) {
    let representation = this.getSettingValue('representation')

    let shortMark = '.'
    let longerMark = '-'
    let spaceMark = '/'

    if (representation === 'code') {
      shortMark = this.getSettingValue('shortMark').getString()
      longerMark = this.getSettingValue('longerMark').getString()
      spaceMark = this.getSettingValue('spaceMark').getString()
    }

    let string = content.toLowerCase().getChars()
      // encode each character
      .map(char => {
        let code = MorseCodeEncoder.encodeCharacter(
          char, shortMark, longerMark, spaceMark)

        if (code === null) {
          throw new InvalidInputError(
            `Char '${char}' is not defined in morse code`)
        }
        return code
      })
      // glue it back together
      .join(' ')

    if (representation === 'timing') {
      // translate to timing representation
      let signalOnMark = this.getSettingValue('signalOnMark').getString()
      let signalOffMark = this.getSettingValue('signalOffMark').getString()

      string = string
        .split('')
        .map(symbol => {
          switch (symbol) {
            // dit
            case '.':
              return signalOnMark
            // dah
            case '-':
              return signalOnMark.repeat(3)
            // letter and word space
            default:
              return signalOffMark
          }
        })
        // glue together and add symbol space
        .join(signalOffMark)
    }

    return Chain.wrap(string)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Decoded content
   */
  performDecode (content) {
    let string = content.getString()
    let representation = this.getSettingValue('representation')

    let shortMark = '.'
    let longerMark = '-'
    let spaceMark = '/'

    if (representation === 'code') {
      shortMark = this.getSettingValue('shortMark').getString()
      longerMark = this.getSettingValue('longerMark').getString()
      spaceMark = this.getSettingValue('spaceMark').getString()
    }

    if (representation === 'timing') {
      // interpret timing code
      let fromMarks = [
        this.getSettingValue('signalOnMark').getString(),
        this.getSettingValue('signalOffMark').getString()]

      string = MorseCodeEncoder.translateMarks(
        string, fromMarks, ['=', '.'])

      // translate timing code to morse code
      string = string
        .replace(/===/g, '-')
        .replace(/\.{7}/g, ' / ')
        .replace(/\.{3}/g, ' ')
        .replace(/\./g, '')
        .replace(/=/g, '.')
    }

    // translate morse code to string
    string = string
      // split characters by space
      .split(' ')
      // decode each character
      .map(rawCode => {
        if (rawCode === '') {
          return null
        }

        let char = MorseCodeEncoder.decodeCode(
          rawCode, shortMark, longerMark, spaceMark)

        if (char === null) {
          throw new InvalidInputError(
            `Code '${rawCode}' is not defined in morse code`)
        }
        return char
      })
      // leave out codes that are not defined
      .filter(char => char !== null)
      // glue it back together
      .join('')

    return Chain.wrap(string)
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
    let mark = setting.filterValue(rawValue)

    // because morse code letters are separated by whitespaces they
    // are not allowed inside morse code marks
    if (mark.match(/\s/) !== null) {
      return {
        key: 'morseCodeMarkWhitespaceNotAllowed',
        message: `Whitespaces are not allowed inside morse code marks`
      }
    }

    let equalSettingName =
      ['shortMark', 'longerMark', 'spaceMark']
        .filter(name => name !== setting.getName())
        .find(name => mark.isEqualTo(this.getSettingValue(name)))

    if (equalSettingName !== undefined) {
      return {
        key: 'morseCodeMarkNotUnique',
        message: `Morse code marks need to be different from each other`
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
    let mark = setting.filterValue(rawValue)
    let equalSettingName =
      ['signalOnMark', 'signalOffMark']
        .filter(name => name !== setting.getName())
        .find(name => mark.indexOf(this.getSettingValue(name)) === 0)

    if (equalSettingName !== undefined) {
      return {
        key: 'morseCodeMarkNotUnique',
        message: `Timing marks need to be different from each other`
      }
    }

    return true
  }

  /**
   * Triggered when a setting value has changed.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'shortMark':
      case 'longerMark':
      case 'spaceMark':
        // revalidate other settings
        ;['shortMark', 'longerMark', 'spaceMark']
          .filter(name => name !== setting.getName())
          .forEach(name => this.getSetting(name).revalidateValue())
        break
      case 'signalOnMark':
      case 'signalOffMark':
        // revalidate other settings
        ;['signalOnMark', 'signalOffMark']
          .filter(name => name !== setting.getName())
          .forEach(name => this.getSetting(name).revalidateValue())
        break
      case 'representation':
        // show & hide fields for given representation
        this.getSetting('shortMark').setVisible(value === 'code')
        this.getSetting('longerMark').setVisible(value === 'code')
        this.getSetting('spaceMark').setVisible(value === 'code')
        this.getSetting('signalOnMark').setVisible(value === 'timing')
        this.getSetting('signalOffMark').setVisible(value === 'timing')
        break
    }
    return super.settingValueDidChange(setting, value)
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
    // handle space
    if (StringUtil.isWhitespace(char)) {
      return spaceMark
    }

    // find char in alphabet
    let index = alphabet.indexOf(char)
    if (index === -1) {
      // char is not defined
      return null
    }

    // translate marks
    let code = codeAlphabet[index]
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
    // handle space
    if (rawCode === spaceMark) {
      return ' '
    }

    // translate marks
    let code = MorseCodeEncoder.translateMarks(
      rawCode, [shortMark, longerMark], ['.', '-'])

    // find code in alphabet
    let index = codeAlphabet.indexOf(code)
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

    // go through string
    while (++i < string.length) {
      markRecognized = false
      j = -1

      // find a mark that needs replacement
      while (!markRecognized && ++j < fromMarks.length) {
        mark = fromMarks[j]
        markRecognized = string.substr(i, mark.length) === mark

        if (markRecognized) {
          // append replacement mark to haystack
          result += toMarks[j]
          i += mark.length - 1
        }
      }
    }

    return result
  }
}
