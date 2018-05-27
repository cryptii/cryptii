
import ByteEncoder from '../ByteEncoder'
import Chain from '../Chain'
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
   * Brick constructor
   */
  constructor () {
    super()
    const variants = ByteEncoder.getBase64Variants()
    this.registerSetting({
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      value: 'base64',
      randomizable: false,
      options: {
        elements: variants.map(variant => variant.name),
        labels: variants.map(variant => variant.label),
        descriptions: variants.map(variant => variant.description)
      }
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain} Encoded content
   */
  performEncode (content) {
    const variant = this.getSettingValue('variant')
    const string = ByteEncoder.base64StringFromBytes(
      content.getBytes(), variant)
    return Chain.wrap(string)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain} Decoded content
   */
  performDecode (content) {
    // remove whitespaces before decoding
    const string = StringUtil.removeWhitespaces(content.getString())
    const variant = this.getSettingValue('variant')
    const bytes = ByteEncoder.bytesFromBase64String(string, variant)
    return Chain.wrap(bytes)
  }
}
