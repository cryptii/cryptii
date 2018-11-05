
import Chain from '../Chain'
import Encoder from '../Encoder'

// possible modes
const CharacterToBlockMode = 0
const BlockToCharacterMode = 1

/**
 * Abstract encoder foundation for encoding and decoding between characters
 * and blocks of characters
 * @abstract
 */
export default class CharacterBlockEncoder extends Encoder {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._mode = CharacterToBlockMode
    this.registerSeparatorSetting()
  }

  /**
   * Sets mode to character to block translation.
   * @protected
   * @return {CharacterBlockEncoder} Fluent interface
   */
  setCharacterToBlockMode () {
    this._mode = CharacterToBlockMode
    return this
  }

  /**
   * Sets mode to block to character translation.
   * @protected
   * @return {CharacterBlockEncoder} Fluent interface
   */
  setBlockToCharacterMode () {
    this._mode = BlockToCharacterMode
    return this
  }

  /**
   * Registers the separator setting.
   * @protected
   * @override
   * @return {CharacterBlockEncoder} Fluent interface
   */
  registerSeparatorSetting () {
    return this.registerSetting({
      name: 'separator',
      type: 'text',
      value: ' ',
      randomizable: false,
      priority: -10,
      options: {
        minLength: 1
      }
    })
  }

  /**
   * Returns the block separator.
   * @protected
   * @override
   * @return {string|Chain}
   */
  getSeparator () {
    return this.getSettingValue('separator')
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    switch (this._mode) {
      case CharacterToBlockMode:
        const blocks = content.getCodePoints()
          .map((codePoint, index) =>
            this.performCharEncodeToBlock(codePoint, index, content))
        return Chain.join(blocks, this.getSeparator())

      case BlockToCharacterMode:
        return content.split(this.getSeparator())
          .map((block, index, blocks) =>
            this.performBlockEncodeToChar(block, index, blocks, content))
    }
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    switch (this._mode) {
      case CharacterToBlockMode:
        return content.split(this.getSeparator())
          .map((block, index, blocks) =>
            this.performBlockDecodeToChar(block, index, blocks, content))

      case BlockToCharacterMode:
        const blocks = content.getCodePoints()
          .map((codePoint, index) =>
            this.performCharDecodeToBlock(codePoint, index, content))
        return Chain.join(blocks, this.getSeparator())
    }
  }

  /**
   * Encodes given character to a block.
   * @protected
   * @abstract
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be encoded
   * @return {string|Chain} Encoded block
   */
  performCharEncodeToBlock (codePoint, index, content) {
    // abstract method
  }

  /**
   * Encodes given block to a character.
   * @protected
   * @abstract
   * @param {Chain} block Block
   * @param {number} index Block index
   * @param {Chain[]} blocks Blocks to be encoded
   * @param {Chain} content Content to be encoded
   * @return {number} Encoded code point
   */
  performBlockEncodeToChar (block, index, blocks, content) {
    // abstract method
  }

  /**
   * Decodes given character to a block.
   * @protected
   * @abstract
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be decoded
   * @return {string|Chain} Decoded block
   */
  performCharDecodeToBlock (codePoint, index, content) {
    // abstract method
  }

  /**
   * Decodes given block to a character.
   * @protected
   * @abstract
   * @param {number} block Block
   * @param {number} index Block index
   * @param {Chain[]} blocks Blocks to be decoded
   * @param {Chain} content Content to be decoded
   * @return {number} Decoded code point
   */
  performBlockDecodeToChar (block, index, blocks, content) {
    // abstract method
  }
}
