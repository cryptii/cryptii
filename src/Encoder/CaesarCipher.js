
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar cipher',
  category: 'Substitution cipher',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const defaultShift = 7

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class CaesarCipherEncoder extends Encoder {
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
        name: 'shift',
        type: 'number',
        label: 'Shift',
        priority: 10,
        value: defaultShift,
        randomizeValue: this.randomizeShiftValue.bind(this),
        options: {
          integer: true
        }
      },
      {
        name: 'alphabet',
        type: 'alphabet',
        value: defaultAlphabet,
        randomizable: false,
        caseSensitivity: false
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
        value: true,
        randomizable: false,
        options: {
          trueLabel: 'Include',
          falseLabel: 'Ignore'
        }
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const { alphabet, shift, caseSensitivity, includeForeignChars } =
      this.getSettingValues()

    // Lowercase content if translation is not case sensitive
    if (!caseSensitivity) {
      content = content.toLowerCase()
    }

    const m = alphabet.getLength()
    const n = content.getLength()
    const result = new Array(n)

    let codePoint, x, y
    let j = 0

    // Go through each character in content
    for (let i = 0; i < n; i++) {
      codePoint = content.getCodePointAt(i)
      x = alphabet.indexOfCodePoint(codePoint)
      if (x === -1) {
        // Character is not in the alphabet
        if (includeForeignChars) {
          result[j++] = codePoint
        }
      } else {
        // Shift character
        y = MathUtil.mod(x + shift * (isEncode ? 1 : -1), m)
        result[j++] = alphabet.getCodePointAt(y)
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
        // Apply case sensitivity on the alphabet setting
        this.getSetting('alphabet').setCaseSensitivity(value)
        break
    }
    super.settingValueDidChange(setting, value)
  }

  /**
   * Generates a random shift setting value.
   * @param {Random} random Random instance
   * @param {Setting} setting Plugboard setting
   * @return {string} Randomized plugboard setting value
   */
  randomizeShiftValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      return random.nextInteger(1, alphabetSetting.getValue().getLength() - 1)
    }
    return null
  }
}
