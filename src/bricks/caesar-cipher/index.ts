
import {
  Chain,
  EncoderBrick,
  Field,
  MathUtil,
  Random
} from '../../'

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class CaesarCipherEncoder extends EncoderBrick {
  /**
   * Brick title
   */
  protected title: string = 'Caesar cipher'

  private static defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'
  private static defaultShift = 7

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSettings([
      {
        name: 'shift',
        type: 'number',
        priority: 10,
        value: CaesarCipherEncoder.defaultShift,
        integer: true,
        describeValue: this.describeShiftValue.bind(this),
        randomizeValue: this.randomizeShiftValue.bind(this),
        randomizable: true
      },
      {
        name: 'alphabet',
        type: 'text',
        priority: -10,
        value: CaesarCipherEncoder.defaultAlphabet,
        blacklistChars: '\r\n',
        uniqueChars: true,
        minLength: 2,
        caseSensitivity: false
      },
      {
        name: 'caseStrategy',
        type: 'enum',
        priority: -20,
        value: 'maintain',
        elements: [
          { value: 'maintain', label: 'Maintain case' },
          { value: 'ignore', label: 'Ignore case' },
          { value: 'strict', label: 'Strict (A ≠ a)' },
        ],
        width: 6
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        priority: -30,
        label: 'Foreign Chars',
        width: 6,
        value: true,
        trueLabel: 'Include',
        falseLabel: 'Ignore'
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content: Chain, isEncode: boolean) {
    // Prepare alphabet(s) depending on chosen case strategy
    let alphabet = this.settings.alphabet
    let uppercaseAlphabet
    if (this.settings.caseStrategy !== 'strict') {
      alphabet = alphabet.toLowerCase()
      uppercaseAlphabet = alphabet.toUpperCase()
    }

    const codePoints = content.getCodePoints()
    const m = alphabet.getLength()
    const n = codePoints.length
    const result = new Array(n)

    let codePoint, x, y, uppercase
    let j = 0

    // Go through each character in content
    for (let i = 0; i < n; i++) {
      codePoint = codePoints[i]

      // Match alphabet character
      x = alphabet.indexOfCodePoint(codePoint)
      uppercase = false

      // Match uppercase alphabet character (depending on case strategy)
      if (x === -1 && this.settings.caseStrategy !== 'strict') {
        x = uppercaseAlphabet.indexOfCodePoint(codePoint)
        uppercase = true
      }

      if (x === -1) {
        // Character is not in the alphabet
        if (this.settings.includeForeignChars) {
          result[j++] = codePoint
        }
      } else {
        // Shift character
        y = MathUtil.mod(x + this.settings.shift * (isEncode ? 1 : -1), m)

        // Translate index to character following the case strategy
        if (this.settings.caseStrategy === 'maintain' && uppercase) {
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
   * @param setting - Sender setting field
   * @param value - New field value
   */
  settingValueDidChange (setting: Field, value: any) {
    switch (setting.getName()) {
      case 'caseStrategy':
        // Apply case sensitivity on the alphabet setting
        this.settingFields.alphabet.setCaseSensitivity(value === 'strict')
        break
      case 'alphabet':
        // The shift value description depends on the alphabet and thus needs
        // to be updated when the alphabet changes
        // this.settingFields.shift.setNeedsValueDescriptionUpdate()
        break
    }
  }

  /**
   * Generates a random shift setting value.
   * @param random - Random instance
   * @param setting - Shift setting
   * @returns Randomized plugboard setting value
   */
  randomizeShiftValue (random: Random, setting: Field): string | undefined {
    if (this.settingFields.alphabet.isValid()) {
      return random
        .nextInteger(1, this.settings.alphabet.getLength() - 1)
        .toString()
    }
    return undefined
  }

  /**
   * Function describing the given shift value in a human-readable way.
   * @param {number} value Field value
   * @param {Field} setting Sender
   * @returns Shift label
   */
  describeShiftValue (value: any, setting: Field): string | undefined {
    // The shift value description depends on the alphabet setting
    if (!this.settingFields.alphabet.isValid()) {
      return undefined
    }

    // Shift the first character of the alphabet to describe the translation
    const plain = this.settings.alphabet.getCharAt(0)
    const index = MathUtil.mod(this.settings.shift, this.settings.alphabet.getLength())
    const encoded = this.settings.alphabet.getCharAt(index)
    return `${plain}→${encoded}`
  }
}
