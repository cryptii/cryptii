
import Chain from '../Chain'
import Encoder from '../Encoder'
import ArrayUtil from '../ArrayUtil'

const meta = {
  name: 'alphabetical-substitution',
  title: 'Alphabetical substitution',
  category: 'Substitution cipher',
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
        type: 'alphabet',
        value: defaultPlaintextAlphabet,
        randomizable: false,
        caseSensitivity: false
      },
      {
        name: 'ciphertextAlphabet',
        type: 'alphabet',
        value: defaultCiphertextAlphabet,
        validateValue: this.validateCiphertextValue.bind(this),
        randomizeValue: this.randomizeCiphertextValue.bind(this),
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
   * Validates ciphertext setting value.
   * @param {mixed} rawValue Raw value
   * @param {Setting} setting Sender setting
   * @return {boolean|object}
   */
  validateCiphertextValue (rawValue, setting) {
    const plaintextAlphabet = this.getSettingValue('plaintextAlphabet')
    let ciphertextAlphabet = setting.filterValue(rawValue)

    if (ciphertextAlphabet.getLength() > plaintextAlphabet.getLength()) {
      return {
        key: 'alphabetContainsUnusedCharacters',
        message: `The ciphertext alphabet is longer than the plaintext alphabet`
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

  /**
   * Extends the ciphertext alphabet with plaintext code points that do not
   * appear in the ciphertext until both alphabets are equal in length.
   * @param {number[]} plaintext Array of plaintext alphabet code points
   * @param {number[]} ciphertext Array of ciphertext alphabet code points
   * @return {Chain} Expanded ciphertext alphabet code points
   */
  _extendAlphabet (plaintext, ciphertext) {
    const expanded = ciphertext.slice()
    let i = 0
    while (expanded.length < plaintext.length) {
      if (ciphertext.indexOf(plaintext[i]) === -1) {
        expanded.push(plaintext[i])
      }
      i++
    }
    return expanded
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const caseSensitivity = this.getSettingValue('caseSensitivity')
    const includeForeignChars = this.getSettingValue('includeForeignChars')
    const plaintext = this.getSettingValue('plaintextAlphabet').getCodePoints()

    // Compose ciphertext alphabet
    const ciphertext = this._extendAlphabet(
      plaintext,
      this.getSettingValue('ciphertextAlphabet').getCodePoints()
    )

    // Swap plaintext and ciphertext alphabets if decoding
    const sourceAlphabet = isEncode ? plaintext : ciphertext
    const destinationAlphabet = isEncode ? ciphertext : plaintext

    // Lowercase content if translation is not case sensitive
    if (!caseSensitivity) {
      content = content.toLowerCase()
    }

    // Map each character from source to destination alphabet
    const codePoints = content.getCodePoints()
    const result = new Array(codePoints.length).fill(0)
    let j = 0
    let charIndex

    for (let i = 0; i < codePoints.length; i++) {
      charIndex = sourceAlphabet.indexOf(codePoints[i])
      if (charIndex !== -1) {
        result[j++] = destinationAlphabet[charIndex]
      } else if (includeForeignChars) {
        result[j++] = codePoints[i]
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

      case 'caseSensitivity':
        // Set case sensitivity of the plaintext and ciphertext alphabets
        this.getSetting('plaintextAlphabet').setCaseSensitivity(value)
        this.getSetting('ciphertextAlphabet').setCaseSensitivity(value)
        break
    }
    super.settingValueDidChange(setting, value)
  }
}
