
import SimpleSubstitutionEncoder from './SimpleSubstitution'

const meta = {
  name: 'rot13',
  title: 'ROT13',
  category: 'Simple Substitution',
  type: 'encoder'
}

/**
 * Encoder Brick for ROT13 encoding and decoding.
 */
export default class ROT13Encoder extends SimpleSubstitutionEncoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Brick constructor
   */
  constructor () {
    super()

    this.registerSetting({
      name: 'variant',
      type: 'enum',
      value: 'rot13',
      randomizable: false,
      style: 'radio',
      options: {
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
        ]
      }
    })
  }

  /**
   * Performs encode or decode on given character, index and content.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index inside content.
   * @param {Chain} content Content to be translated.
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @return {number} Resulting Unicode code point
   */
  performCharTranslate (codePoint, index, content, isEncode) {
    let variant = this.getSettingValue('variant')

    if (variant === 'rot5' || variant === 'rot18') {
      // rotate numbers 0-9
      codePoint = this._rotateCodePoint(codePoint, 48, 57)
    }

    if (variant === 'rot13' || variant === 'rot18') {
      // rotate lowercase letters a-z
      codePoint = this._rotateCodePoint(codePoint, 97, 122)
      // rotate uppercase letters A-Z
      codePoint = this._rotateCodePoint(codePoint, 65, 90)
    }

    if (variant === 'rot47') {
      // rotate characters !-~
      codePoint = this._rotateCodePoint(codePoint, 33, 126)
    }

    return codePoint
  }

  /**
   * Rotates code point inside given bounds.
   * @param {number} codePoint Unicode code point
   * @param {number} start
   * @param {number} end
   * @return {number} Rotated Unicode code point
   */
  _rotateCodePoint (codePoint, start, end) {
    // only rotate if code point is inside bounds
    if (codePoint >= start && codePoint <= end) {
      let count = end - start + 1
      codePoint += count / 2

      if (codePoint > end) {
        codePoint -= count
      }
    }
    return codePoint
  }
}
