import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import ArrayUtil from '../ArrayUtil.js'

const meta = {
  name: 'alphabetical-substitution',
  title: 'Alphabetical substitution',
  category: 'Ciphers',
  type: 'encoder'
}

const defaultPlaintextAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const defaultCiphertextAlphabet = 'zyxwvutsrqponmlkjihgfedcba'

/**
 * Encoder brick for alphabetical substitution
 */
export default class AlphabeticalSubstitutionEncoder extends Encoder {
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
        name: 'plaintextAlphabet',
        type: 'text',
        value: defaultPlaintextAlphabet,
        uniqueChars: true,
        minLength: 2,
        caseSensitivity: false,
        randomizable: false
      },
      {
        name: 'ciphertextAlphabet',
        type: 'text',
        value: defaultCiphertextAlphabet,
        uniqueChars: true,
        minLength: 0,
        caseSensitivity: false,
        validateValue: this.validateCiphertextValue.bind(this),
        randomizeValue: this.randomizeCiphertextValue.bind(this)
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
        trueLabel: 'Include',
        falseLabel: 'Ignore',
        width: 6,
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
    const caseStrategy = this.getSettingValue('caseStrategy')
    const includeForeignChars = this.getSettingValue('includeForeignChars')

    // Retrieve alphabets
    let sourceAlphabet = this.getSettingValue('plaintextAlphabet')
    let destAlphabet =
      this.getSettingValue('ciphertextAlphabet').extend(sourceAlphabet)

    // Swap source and destination alphabets if decoding
    if (!isEncode) {
      ;[destAlphabet, sourceAlphabet] = [sourceAlphabet, destAlphabet]
    }

    // Prepare uppercase alphabets if needed by case strategy
    let uppercaseSourceAlphabet, uppercaseDestAlphabet
    if (caseStrategy !== 'strict') {
      sourceAlphabet = sourceAlphabet.toLowerCase()
      destAlphabet = destAlphabet.toLowerCase()
      uppercaseSourceAlphabet = sourceAlphabet.toUpperCase()
      uppercaseDestAlphabet = destAlphabet.toUpperCase()
    }

    const codePoints = content.getCodePoints()
    const result = new Array(codePoints.length).fill(0)

    let codePoint, charIndex, uppercase
    let j = 0

    // Map each character from source to destination alphabet
    for (let i = 0; i < codePoints.length; i++) {
      codePoint = codePoints[i]

      // Match alphabet character
      charIndex = sourceAlphabet.indexOfCodePoint(codePoint)
      uppercase = false

      // Match uppercase alphabet character (depending on case strategy)
      if (charIndex === -1 && caseStrategy !== 'strict') {
        charIndex = uppercaseSourceAlphabet.indexOfCodePoint(codePoint)
        uppercase = true
      }

      if (charIndex !== -1) {
        // Put char index back into a character following the case strategy
        if (caseStrategy === 'maintain' && uppercase) {
          result[j++] = uppercaseDestAlphabet.getCodePointAt(charIndex)
        } else {
          result[j++] = destAlphabet.getCodePointAt(charIndex)
        }
      } else if (includeForeignChars) {
        result[j++] = codePoint
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
      case 'plaintextAlphabet':
        // The validity of the ciphertext alphabet depends
        // on the plaintext alphabet
        this.getSetting('ciphertextAlphabet').revalidateValue()
        break

      case 'caseStrategy':
        this.getSetting('plaintextAlphabet')
          .setCaseSensitivity(value === 'strict')
        this.getSetting('ciphertextAlphabet')
          .setCaseSensitivity(value === 'strict')
        break
    }
  }

  /**
   * Validates ciphertext setting value.
   * @protected
   * @param {mixed} rawValue Raw value
   * @param {Setting} setting Sender setting
   * @return {boolean|object}
   */
  validateCiphertextValue (rawValue, setting) {
    // The ciphertext alphabet depends on the plaintext alphabet
    if (!this.isSettingValid('plaintextAlphabet')) {
      return false
    }

    const plaintextAlphabet = this.getSettingValue('plaintextAlphabet')
    if (rawValue.getLength() > plaintextAlphabet.getLength()) {
      return {
        key: 'alphabetContainsUnusedCharacters',
        message: 'The ciphertext alphabet is longer than the plaintext alphabet'
      }
    }

    return true
  }

  /**
   * Generates a random ciphertext setting value.
   * @protected
   * @param {Random} random Random instance
   * @param {Setting} setting Setting instance
   * @return {Chain|null} Random ciphertext setting value
   */
  randomizeCiphertextValue (random, setting) {
    // The ciphertext alphabet value can only be randomized when having
    // a valid plaintext alphabet
    if (!this.getSetting('plaintextAlphabet').isValid()) {
      return null
    }

    // Shuffle the plaintext alphabet to compose a ciphertext alphabet
    const plaintextAlphabet = this.getSettingValue('plaintextAlphabet')
    return Chain.wrap(ArrayUtil.shuffle(plaintextAlphabet.getCodePoints()))
  }
}
