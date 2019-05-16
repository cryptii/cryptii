
import ByteEncoder from '../ByteEncoder'
import Encoder from '../Encoder'
import StringUtil from '../StringUtil'

const meta = {
  name: 'base64',
  title: 'Base64',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * Encoder brick for base64 encoding and decoding
 */
export default class Base64Encoder extends Encoder {
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
    const variants = ByteEncoder.getBase64Variants()
    this.addSetting({
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      value: 'base64',
      elements: variants.map(variant => variant.name),
      labels: variants.map(variant => variant.label),
      descriptions: variants.map(variant => variant.description),
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
    const variant = this.getSettingValue('variant')
    return ByteEncoder.base64StringFromBytes(content.getBytes(), variant)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    // Remove whitespaces before decoding
    const string = StringUtil.removeWhitespaces(content.getString())
    const variant = this.getSettingValue('variant')
    return ByteEncoder.bytesFromBase64String(string, variant)
  }
}
