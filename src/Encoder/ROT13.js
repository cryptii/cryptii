import Encoder from '../Encoder.js'

const meta = {
  name: 'rot13',
  title: 'ROT13',
  category: 'Ciphers',
  type: 'encoder'
}

/**
 * Encoder brick for ROT13 encoding and decoding
 */
export default class ROT13Encoder extends Encoder {
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
    this.addSetting({
      name: 'variant',
      type: 'enum',
      value: 'rot13',
      elements: [
        'rot5',
        'rot13',
        'rot18',
        'rot47'
      ],
      labels: [
        'ROT5 (0-9)',
        'ROT13 (A-Z, a-z)',
        'ROT18 (0-9, A-Z, a-z)',
        'ROT47 (!-~)'
      ],
      randomizable: false,
      style: 'radio'
    })
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const variant = this.getSettingValue('variant')
    return content.getCodePoints().map(codePoint => {
      // Rotate numbers 0-9
      if (variant === 'rot5' || variant === 'rot18') {
        codePoint = this._rotateCodePoint(codePoint, 48, 57)
      }

      // Rotate lowercase letters a-z, A-Z
      if (variant === 'rot13' || variant === 'rot18') {
        codePoint = this._rotateCodePoint(codePoint, 97, 122)
        codePoint = this._rotateCodePoint(codePoint, 65, 90)
      }

      // Rotate characters !-~
      if (variant === 'rot47') {
        codePoint = this._rotateCodePoint(codePoint, 33, 126)
      }

      return codePoint
    })
  }

  /**
   * Rotates code point inside given bounds.
   * @param {number} codePoint Unicode code point
   * @param {number} start
   * @param {number} end
   * @return {number} Rotated Unicode code point
   */
  _rotateCodePoint (codePoint, start, end) {
    // Only rotate if code point is inside bounds
    if (codePoint >= start && codePoint <= end) {
      const count = end - start + 1
      codePoint += count / 2

      if (codePoint > end) {
        codePoint -= count
      }
    }
    return codePoint
  }
}
