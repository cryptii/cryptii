import Encoder from '../Encoder.js'
import MathUtil from '../MathUtil.js'

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar cipher',
  category: 'Ciphers',
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
        integer: true,
        useBigInt: true,
        describeValue: this.describeShiftValue.bind(this),
        randomizeValue: this.randomizeShiftValue.bind(this)
      },
      {
        name: 'alphabet',
        type: 'text',
        value: defaultAlphabet,
        uniqueChars: true,
        minLength: 2,
        caseSensitivity: false,
        randomizable: false
      },
      {
        name: 'caseStrategy',
        type: 'enum',
        value: 'maintain',
        elements: ['maintain', 'ignore', 'strict'],
        labels: ['Maintain case', 'Ignore case', 'Strict (A ≠ a)'],
        width: 6,
        randomizable: false
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        label: 'Foreign Chars',
        width: 6,
        value: true,
        trueLabel: 'Include',
        falseLabel: 'Ignore',
        randomizable: false
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content, isEncode) {
    const { shift, caseStrategy, includeForeignChars } =
      this.getSettingValues()

    // Prepare alphabet(s) depending on chosen case strategy
    let alphabet = this.getSettingValue('alphabet')
    let uppercaseAlphabet
    if (caseStrategy !== 'strict') {
      alphabet = alphabet.toLowerCase()
      uppercaseAlphabet = alphabet.toUpperCase()
    }

    const m = alphabet.getLength()
    const n = content.getLength()
    const result = new Array(n)

    let codePoint, x, y, uppercase
    let j = 0

    // Go through each character in content
    for (let i = 0; i < n; i++) {
      codePoint = content.getCodePointAt(i)

      // Match alphabet character
      x = alphabet.indexOfCodePoint(codePoint)
      uppercase = false

      // Match uppercase alphabet character (depending on case strategy)
      if (x === -1 && caseStrategy !== 'strict') {
        x = uppercaseAlphabet.indexOfCodePoint(codePoint)
        uppercase = true
      }

      if (x === -1) {
        // Character is not in the alphabet
        if (includeForeignChars) {
          result[j++] = codePoint
        }
      } else {
        // Shift character
        if (typeof shift !== 'bigint') {
          y = MathUtil.mod(x + shift * (isEncode ? 1 : -1), m)
        } else {
          y = Number(MathUtil.mod(
            BigInt(x) + shift * BigInt(isEncode ? 1 : -1),
            BigInt(m)
          ))
        }

        // Translate index to character following the case strategy
        if (caseStrategy === 'maintain' && uppercase) {
          result[j++] = uppercaseAlphabet.getCodePointAt(y)
        } else {
          result[j++] = alphabet.getCodePointAt(y)
        }
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
      case 'caseStrategy':
        // Apply case sensitivity on the alphabet setting
        this.getSetting('alphabet').setCaseSensitivity(value === 'strict')
        break
      case 'alphabet':
        // The shift value description depends on the alphabet and thus needs
        // to be updated when the alphabet changes
        this.getSetting('shift').setNeedsValueDescriptionUpdate()
        break
    }
  }

  /**
   * Generates a random shift setting value.
   * @param {Random} random Random instance
   * @param {Field} setting Shift setting
   * @return {string} Randomized plugboard setting value
   */
  randomizeShiftValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      return random.nextInteger(1, alphabetSetting.getValue().getLength() - 1)
    }
    return null
  }

  /**
   * Function describing the given shift value in a human-readable way.
   * @param {number} value Field value
   * @param {Field} setting Sender
   * @return {?string} Shift label
   */
  describeShiftValue (value, setting) {
    // The shift value description depends on the alphabet setting
    if (!this.getSetting('alphabet').isValid()) {
      return null
    }

    // Shift the first character of the alphabet to describe the translation
    const { alphabet, shift } = this.getSettingValues()
    const plain = alphabet.getCharAt(0)
    const index = MathUtil.mod(
      shift,
      typeof shift !== 'bigint'
        ? alphabet.getLength()
        : BigInt(alphabet.getLength())
    )
    const encoded = alphabet.getCharAt(index)
    return `${plain}→${encoded}`
  }
}
