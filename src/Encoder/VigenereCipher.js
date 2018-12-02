
import Chain from '../Chain'
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'

const meta = {
  name: 'vigenere-cipher',
  title: 'Vigenère cipher',
  category: 'Substitution cipher',
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
        options: {
          elements: [
            'standard',
            'beaufort-cipher',
            'variant-beaufort-cipher',
            'trithemius-cipher'
          ],
          labels: [
            'Standard',
            'Beaufort cipher',
            'Variant Beaufort cipher',
            'Trithemius cipher'
          ]
        }
      },
      {
        name: 'key',
        type: 'text',
        value: 'cryptii',
        options: {
          allowedChars: defaultAlphabet,
          minLength: 2
        }
      },
      {
        name: 'keyMode',
        type: 'enum',
        value: 'repeat',
        randomizable: false,
        options: {
          elements: [
            'repeat',
            'autokey'
          ],
          labels: [
            'Repeat',
            'Autokey'
          ]
        }
      },
      {
        name: 'alphabet',
        type: 'alphabet',
        value: defaultAlphabet,
        randomizable: false
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
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const { variant, alphabet, includeForeignChars } = this.getSettingValues()

    // Handle case sensitivity
    if (!this.getSettingValue('caseSensitivity')) {
      content = content.toLowerCase()
    }

    // Choose key and key mode
    let { key, keyMode } = this.getSettingValues()
    if (variant === 'trithemius-cipher') {
      key = alphabet
      keyMode = 'repeat'
    }

    // Translate each character
    let j = 0
    let resultCodePoints = []
    let charIndex, codePoint, resultCodePoint, keyCodePoint, keyIndex

    for (let i = 0; i < content.getLength(); i++) {
      codePoint = content.getCodePointAt(i)
      charIndex = alphabet.indexOfCodePoint(codePoint)

      if (charIndex !== -1) {
        // Calculate shift from key
        keyCodePoint = key.getCodePointAt(MathUtil.mod(j, key.getLength()))
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

        // Match code point to shifted char index and add it to result
        charIndex = MathUtil.mod(charIndex, alphabet.getLength())
        resultCodePoint = alphabet.getCodePointAt(charIndex)
        resultCodePoints.push(resultCodePoint)

        // Extend the key with the current character, if requested
        if (keyMode === 'autokey') {
          const nextKeyCodePoint = isEncode ? codePoint : resultCodePoint
          key = Chain.join([key, Chain.wrap([nextKeyCodePoint])], '')
        }

        j++
      } else if (includeForeignChars) {
        // Add foreign character to result
        resultCodePoints.push(codePoint)
      }
    }

    return resultCodePoints
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
        this.getSetting('key').setAllowedChars(value)
        break
      case 'caseSensitivity':
        // Also set case sensitivity on alphabet and key setting
        this.getSetting('alphabet').setCaseSensitivity(value)
        this.getSetting('key').setCaseSensitivity(value)
        break
    }
    super.settingValueDidChange(setting, value)
  }
}
