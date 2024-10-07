import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import MathUtil from '../MathUtil.js'

const meta = {
  name: 'vigenere-cipher',
  title: 'Vigenère cipher',
  category: 'Ciphers',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'

/**
 * Encoder brick for Vigenère cipher encoding and decoding
 */
export default class VigenereCipherEncoder extends Encoder {
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
        value: 'standard',
        elements: [
          'standard',
          'beaufort-cipher',
          'variant-beaufort-cipher',
          'trithemius-cipher'
        ],
        labels: [
          'Standard Vigenère cipher',
          'Beaufort cipher',
          'Variant Beaufort cipher',
          'Trithemius cipher'
        ],
        randomizable: false
      },
      {
        name: 'key',
        type: 'text',
        value: 'cryptii',
        whitelistChars: defaultAlphabet,
        minLength: 2,
        caseSensitivity: false
      },
      {
        name: 'keyMode',
        type: 'enum',
        value: 'repeat',
        elements: [
          'repeat',
          'autokey'
        ],
        labels: [
          'Repeat',
          'Autokey'
        ],
        randomizable: false
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
        randomizable: false,
        trueLabel: 'Include',
        falseLabel: 'Ignore'
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content, isEncode) {
    const { variant, caseStrategy, includeForeignChars } =
      this.getSettingValues()

    // Prepare alphabet(s) depending on case strategy
    let alphabet = this.getSettingValue('alphabet')
    let uppercaseAlphabet
    if (caseStrategy !== 'strict') {
      alphabet = alphabet.toLowerCase()
      uppercaseAlphabet = alphabet.toUpperCase()
    }

    // Choose key and key mode
    let { key, keyMode } = this.getSettingValues()
    if (variant === 'trithemius-cipher') {
      key = alphabet
      keyMode = 'repeat'
    }

    const inputLength = content.getLength()
    const result = new Array(inputLength)

    let charIndex, codePoint, uppercase, keyCodePoint, keyIndex
    let j = 0
    let k = 0

    // Translate each character
    for (let i = 0; i < inputLength; i++) {
      codePoint = content.getCodePointAt(i)

      // Match alphabet character
      charIndex = alphabet.indexOfCodePoint(codePoint)
      uppercase = false

      // Match uppercase alphabet character (depending on case strategy)
      if (charIndex === -1 && caseStrategy !== 'strict') {
        charIndex = uppercaseAlphabet.indexOfCodePoint(codePoint)
        uppercase = true
      }

      if (charIndex !== -1) {
        // Calculate shift from key
        keyCodePoint = key.getCodePointAt(MathUtil.mod(k, key.getLength()))
        keyIndex = alphabet.indexOfCodePoint(keyCodePoint)

        // Shift char index depending on variant
        switch (variant) {
          case 'beaufort-cipher':
            charIndex = keyIndex - charIndex
            break
          case 'variant-beaufort-cipher':
            charIndex = isEncode
              ? charIndex - keyIndex
              : charIndex + keyIndex
            break
          default:
            charIndex = isEncode
              ? charIndex + keyIndex
              : charIndex - keyIndex
        }

        // Rotate char index
        charIndex = MathUtil.mod(charIndex, alphabet.getLength())

        // Map char index to character following the case strategy
        if (caseStrategy === 'maintain' && uppercase) {
          result[j++] = uppercaseAlphabet.getCodePointAt(charIndex)
        } else {
          result[j++] = alphabet.getCodePointAt(charIndex)
        }

        // Extend the key with the current char index, if requested
        if (keyMode === 'autokey') {
          keyCodePoint = isEncode ? codePoint : alphabet.getCodePointAt(charIndex)
          key = Chain.join([key, Chain.wrap([keyCodePoint]).toLowerCase()], '')
        }

        k++
      } else if (includeForeignChars) {
        // Add foreign character to result
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
      case 'variant':
        // Key and keyMode setting visibility depend on the variant
        this.getSetting('key').setVisible(value !== 'trithemius-cipher')
        this.getSetting('keyMode').setVisible(value !== 'trithemius-cipher')
        break
      case 'alphabet':
        // Update allowed chars of key setting
        this.getSetting('key').setWhitelistChars(value)
        break
      case 'caseStrategy':
        this.getSetting('alphabet').setCaseSensitivity(value === 'strict')
        this.getSetting('key').setCaseSensitivity(value === 'strict')
        break
    }
  }
}
