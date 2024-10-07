import MathUtil from '../MathUtil.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'affine-cipher',
  title: 'Affine cipher',
  category: 'Ciphers',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'

/**
 * Encoder brick for Affine Cipher encoding and decoding
 */
export default class AffineCipherEncoder extends Encoder {
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

    // Linear function
    // f(x) = ax + b

    this.addSettings([
      {
        name: 'a',
        type: 'number',
        label: 'Slope / a',
        value: 5,
        integer: true,
        min: 1,
        validateValue: this.validateSlopeValue.bind(this),
        randomizeValue: this.randomizeSlopeValue.bind(this),
        width: 6
      },
      {
        name: 'b',
        type: 'number',
        label: 'Intercept / b',
        value: 8,
        integer: true,
        min: 1,
        randomizeValue: this.randomizeInterceptValue.bind(this),
        width: 6
      },
      {
        name: 'alphabet',
        type: 'text',
        value: defaultAlphabet,
        uniqueChars: true,
        minLength: 2,
        randomizable: false,
        caseSensitivity: false
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
        value: true,
        width: 6,
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
    const { a, b, caseStrategy, includeForeignChars } = this.getSettingValues()

    // Prepare alphabet(s) depending on chosen case strategy
    let alphabet = this.getSettingValue('alphabet')
    let uppercaseAlphabet
    if (caseStrategy !== 'strict') {
      alphabet = alphabet.toLowerCase()
      uppercaseAlphabet = alphabet.toUpperCase()
    }

    const m = alphabet.getLength()
    const n = content.getLength()
    const result = new Array(n).fill(0)

    let codePoint, uppercase, i, c, x, y
    let j = 0

    for (i = 0; i < n; i++) {
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
        // Character not in alphabet
        if (includeForeignChars) {
          // Take over character unchanged
          result[j++] = codePoint
        }
      } else {
        // Translate character index through linear function
        if (isEncode) {
          // E(x) = (ax + b) mod m
          y = MathUtil.mod(a * x + b, m)
        } else {
          // D(x) = (a^-1(x - b)) mod m
          c = MathUtil.xgcd(a, m)[0]
          y = MathUtil.mod(c * (x - b), m)
        }

        // Put index back into a character following the case strategy
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
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        // Changing the alphabet setting value can invalidate the slope setting
        this.getSetting('a').revalidateValue()
        break
      case 'caseStrategy':
        this.getSetting('alphabet').setCaseSensitivity(value === 'strict')
        break
    }
  }

  /**
   * Validates slope (a) setting value.
   * @param {number} a
   * @return {boolean|object}
   */
  validateSlopeValue (a) {
    const alphabetSetting = this.getSetting('alphabet')
    if (!alphabetSetting.isValid()) {
      // Can't validate slope without valid alphabet setting
      return false
    }

    // The value a must be chosen such that a and m are coprime
    const m = alphabetSetting.getValue().getLength()
    if (!MathUtil.isCoprime(a, m)) {
      return {
        key: 'affineCipherFunctionInvalid',
        message:
          'The value must be chosen such that it is coprime to the size ' +
          `of the alphabet (${m})`
      }
    }

    return true
  }

  /**
   * Generates a random slope setting value.
   * @protected
   * @param {Random} random Random instance
   * @param {Setting} setting Setting instance
   * @return {string} Random slope setting value
   */
  randomizeSlopeValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      const alphabet = alphabetSetting.getValue()
      const m = alphabet.getLength()

      // Create range based on alphabet and filter coprime values
      // Don't use caesar cipher slope (a=1) if possible
      const range = alphabet.getCodePoints().map((_, i) => i + 1)
      const coprimes = range.filter(a => a > 1 && MathUtil.isCoprime(a, m))
      return coprimes.length > 0 ? random.nextChoice(coprimes) : 1
    }
    return null
  }

  /**
   * Generates a random intercept setting value.
   * @protected
   * @param {Random} random Random instance
   * @param {Setting} setting Setting instance
   * @return {string} Random intercept setting value
   */
  randomizeInterceptValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      const m = this.getSetting('alphabet').getValue().getLength()
      return random.nextInteger(1, m - 1)
    }
    return null
  }
}
