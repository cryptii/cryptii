
import ByteEncoder from '../ByteEncoder'
import Chain from '../Chain'
import Encoder from '../Encoder'

const meta = {
  name: 'base64',
  title: 'Base64',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * Encoder Brick for base64 encoding and decoding.
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

    let variants = ByteEncoder.getBase64Variants()

    this.registerSetting({
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      value: 'base64',
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
   * @param {string} content
   * @return {Chain} Encoded content
   */
  performEncode (content) {
    let variant = this.getSettingValue('variant')
    let string = ByteEncoder.base64StringFromBytes(content.getBytes(), variant)
    return new Chain(string)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {string} content
   * @return {Chain} Decoded content
   */
  performDecode (content) {
    let variant = this.getSettingValue('variant')
    let bytes = ByteEncoder.bytesFromBase64String(content.getString(), variant)
    return new Chain(bytes)
  }
}
