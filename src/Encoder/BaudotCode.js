import Encoder from '../Encoder.js'
import ArrayUtil from '../ArrayUtil.js'
import TextEncoder from '../TextEncoder.js'

const meta = {
  name: 'baudot-code',
  title: 'Baudot code',
  category: 'Encoding',
  type: 'encoder'
}

// TODO: Map following content characters: ³ -> 3/, ⁵ -> ⁵, ⁹ -> 9/, ⁷ -> 7/

/**
 * Baudot code variants and their character sets
 * Character set positions: Letter set (0-31), Figure set (32-63)
 * FS -> switch to figure set, LS -> switch to letter set, null -> undefined
 * @see https://en.wikipedia.org/wiki/Baudot_code#Character_set
 * @type {array}
 */
const variants = [
  /* eslint-disable no-multi-spaces */
  {
    name: 'ita1',
    label: 'Original Baudot - ITA 1',
    characterSet: [
      0,    'A',  'E',  '\r', 'Y',  'U',  'I',  'O',
      'FS', 'J',  'G',  'H',  'B',  'C',  'F',  'D',
      ' ',  '\n', 'X',  'Z',  'S',  'T',  'W',  'V',
      127,  'K',  'M',  'L',  'R',  'Q',  'N',  'P',
      0,    '1',  '2',  '\r', '3',  '4',  null, '5',
      ' ',  '6',  '7',  '+',  '8',  '9',  null, '0',
      'LS', '\n', ',',  ':',  '.',  null, '?',  '\'',
      127,  '(',  ')',  '=',  '-',  '/',  null, '%'
    ]
  },
  {
    name: 'original-eu',
    label: 'Original Baudot - Continental European',
    extends: 'ita1',
    overrides: {
      3: 'É',
      17: 'T',
      35: '&',
      38: 'º',
      43: 'h',
      46: 'f',
      49: '.',
      52: ';',
      53: '!',
      62: '№'
    }
  },
  {
    name: 'original-uk',
    label: 'Original Baudot - Domestic UK',
    extends: 'ita1',
    overrides: {
      3: '/',
      18: '-',
      35: '⅟',
      38: '³',
      43: '¹',
      46: '⁵',
      49: '.',
      50: '⁹',
      52: '⁷',
      53: '²',
      62: '£',
      63: '+'
    }
  },
  {
    // Position 63 = LS/DEL is mapped to Shift in
    name: 'ita2',
    label: 'Baudot-Murray - ITA 2',
    characterSet: [
      0,    'E',  '\n', 'A',  ' ',  'S',  'I',  'U',
      '\r', 'D',  'R',  'J',  'N',  'F',  'C',  'K',
      'T',  'Z',  'L',  'W',  'H',  'Y',  'P',  'Q',
      'O',  'B',  'G',  'FS', 'M',  'X',  'V',  15,
      0,    '3',  '\n', '-',  ' ',  '\'', '8',  '7',
      '\r', 5,    '4',  7,    ',',  '!',  ':',  '(',
      '5',  '+',  ')',  '2',  '£',  '6',  '0',  '1',
      '9',  '?',  '&',  14,   '.',  '/',  '=',  'LS'
    ]
  },
  {
    name: 'us-tty',
    label: 'Baudot-Murray - US-TTY',
    extends: 'ita2',
    overrides: {
      37: '\'',  41: 5,     43: 7,     49: '+',   52: '£',   62: '='
    }
  },
  {
    // Positions 2 & 34 = COL is mapped to null
    name: 'murray-code',
    label: 'Baudot-Murray - Murray Code',
    extends: 'ita2',
    overrides: {
      0: ' ',
      2: null,
      4: 15,
      8: '\n',
      31: '*',
      32: ' ',
      34: null,
      35: null,
      36: 'LS',
      40: '\n',
      41: '²',
      43: '⁷',
      44: '-',
      45: '⅟',
      46: '(',
      47: '⁹',
      49: '.',
      50: '/',
      52: '⁵',
      58: '³',
      60: ',',
      61: '£',
      62: ')',
      63: '*'
    }
  }
  /* eslint-enable no-multi-spaces */
]

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

    // Cached variant specs
    this._variantCharacterSet = []

    this.addSetting({
      name: 'variant',
      type: 'enum',
      value: 'ita2',
      elements: variants.map(variant => variant.name),
      labels: variants.map(variant => variant.label),
      randomizable: false
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    // Retrieve character set
    const variant = this.getSettingValue('variant')
    const characterSet = this.getVariantCharacterSet(variant)
    const switchToFigures = characterSet.indexOf('FS') % 32
    const switchToLetters = characterSet.indexOf('LS') % 32

    const codePoints = content.getCodePoints()
    const m = codePoints.length

    const tape = []
    let index, codePoint
    let figureSet = false

    // Go through code points
    for (let i = 0; i < m; i++) {
      codePoint = codePoints[i]
      index = characterSet.indexOf(codePoint)

      // If character was not found try to map the uppercase character
      if (index === -1 && codePoint >= 97 && codePoint <= 122) {
        index = characterSet.indexOf(codePoint - 32)
      }

      if (index >= 0 && index < 32) {
        // This character is situated on the letter set
        // Switch to letter set
        if (figureSet) {
          tape.push(switchToLetters)
          figureSet = false
        }
        tape.push(index)
      } else if (index >= 32) {
        // This character is situated on the figure set
        // Switch to figure set
        if (!figureSet) {
          tape.push(switchToFigures)
          figureSet = true
        }
        tape.push(index - 32)
      }
    }

    // Compose byte array from 5-bit tape
    return ArrayUtil.resizeBitSizedArray(tape, 5, 8)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    // Retrieve character set
    const variant = this.getSettingValue('variant')
    const characterSet = this.getVariantCharacterSet(variant)
    const switchToFigures = characterSet.indexOf('FS') % 32
    const switchToLetters = characterSet.indexOf('LS') % 32

    // Compose 5-bit tape from byte array
    const tape = ArrayUtil.resizeBitSizedArray(content.getBytes(), 8, 5, true)
    const result = new Array(tape.length)

    // Go through tape and map each character to Unicode code points
    let char, codePoint
    let figureSet = false
    let j = 0

    for (let i = 0; i < tape.length; i++) {
      char = tape[i]

      if (!figureSet && char === switchToFigures) {
        // Switch to figure set
        figureSet = true
      } else if (figureSet && char === switchToLetters) {
        // Switch to letter set
        figureSet = false
      } else {
        // Map tape character
        codePoint = characterSet[char + (figureSet ? 32 : 0)]
        if (codePoint !== null) {
          result[j++] = codePoint
        }
      }
    }

    return result.slice(0, j)
  }

  /**
   * Composes the character set for the given variant name.
   * @param {string} name Variant name
   * @return {array|null} Character set array or null if it not defined
   */
  getVariantCharacterSet (name) {
    // Return cached character set, if available
    if (this._variantCharacterSet[name] !== undefined) {
      return this._variantCharacterSet[name]
    }

    // Find variant spec by name
    const spec = variants.find(variant => variant.name === name)
    if (spec === undefined) {
      return null
    }

    // Retrieve character set
    let characterSet = (spec.characterSet || []).slice()

    // Extend character set if this variant extends another one
    if (spec.extends) {
      const parent = this.getVariantCharacterSet(spec.extends)
      if (parent !== null) {
        characterSet = parent.slice()
      }
    }

    // Apply overrides
    if (spec.overrides) {
      for (const i in spec.overrides) {
        characterSet[i] = spec.overrides[i]
      }
    }

    // Map string chars to code points
    for (let i = 0; i < characterSet.length; i++) {
      const entry = characterSet[i]
      if (entry !== 'FS' && entry !== 'LS' && entry !== null) {
        characterSet[i] =
          typeof entry === 'string'
            ? TextEncoder.codePointsFromString(entry)[0]
            : entry
      }
    }

    // Cache variant character set
    this._variantCharacterSet[name] = characterSet
    return characterSet
  }
}
