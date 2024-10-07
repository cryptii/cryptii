import CharacterBlockEncoder from './CharacterBlock.js'
import InvalidInputError from '../Error/InvalidInput.js'
import TextEncoder from '../TextEncoder.js'

const meta = {
  name: 'unicode-code-points',
  title: 'Unicode code points',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * Encoder brick for translation between characters and their respective
 * Unicode code point values in a given format
 */
export default class UnicodeCodePointsEncoder extends CharacterBlockEncoder {
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
    this.setCharacterToBlockMode()
    this.addSetting({
      name: 'format',
      type: 'enum',
      value: 'unicode',
      elements: [
        'unicode',
        'decimal',
        'hexadecimal',
        'binary',
        'octal',
        'ncr-decimal',
        'ncr-hexadecimal'
      ],
      labels: [
        'Unicode notation',
        'Decimal',
        'Hexadecimal',
        'Binary',
        'Octal',
        'NCR (Decimal)',
        'NCR (Hexadecimal)'
      ],
      randomizable: false,
      style: 'radio'
    })
  }

  /**
   * Encodes given character to a block.
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be encoded
   * @return {string|Chain} Encoded block
   */
  performCharEncodeToBlock (codePoint, index, content) {
    switch (this.getSettingValue('format')) {
      case 'unicode':
        return 'U+' + codePoint.toString(16).toUpperCase()
      case 'decimal':
        return codePoint.toString(10)
      case 'hexadecimal':
        return codePoint.toString(16)
      case 'binary':
        return codePoint.toString(2)
      case 'octal':
        return codePoint.toString(8)
      case 'ncr-decimal':
        return `&#${codePoint.toString(10)};`
      case 'ncr-hexadecimal':
        return `&#x${codePoint.toString(16)};`
    }
  }

  /**
   * Decodes given block to a character.
   * @param {number} block Block
   * @param {number} index Block index
   * @param {Chain[]} blocks Blocks to be decoded
   * @param {Chain} content Content to be decoded
   * @return {number} Decoded code point
   */
  performBlockDecodeToChar (block, index, blocks, content) {
    let codePoint = 0
    let result
    switch (this.getSettingValue('format')) {
      case 'unicode':
        // Interpret unicode notation
        result = block.match(/^U\+([0-9A-F]+)$/i)
        if (result !== null) {
          codePoint = parseInt(result[1], 16)
        }
        break
      case 'decimal':
        codePoint = parseInt(block, 10)
        break
      case 'hexadecimal':
        codePoint = parseInt(block, 16)
        break
      case 'binary':
        codePoint = parseInt(block, 2)
        break
      case 'octal':
        codePoint = parseInt(block, 8)
        break
      case 'ncr-decimal':
      case 'ncr-hexadecimal':
        // try to interpret hex ncr
        result = block.match(/^&#x([0-9A-F]+);$/i)
        if (result !== null) {
          codePoint = parseInt(result[1], 16)
        } else {
          // try to interpret decimal ncr
          result = block.match(/^&#([0-9]+);$/)
          if (result !== null) {
            codePoint = parseInt(result[1], 10)
          }
        }
        break
    }

    if (!TextEncoder.validateCodePoint(codePoint)) {
      throw new InvalidInputError(`Invalid code point at index ${index}`)
    }

    return codePoint
  }
}
