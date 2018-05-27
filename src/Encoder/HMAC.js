
import Chain from '../Chain'
import Encoder from '../Encoder'
import HashEncoder from './Hash'

const meta = {
  name: 'hmac',
  title: 'HMAC',
  category: 'Modern cryptography',
  type: 'encoder'
}

/**
 * Encoder brick for creating HMAC digests using given hash function
 */
export default class HMACEncoder extends Encoder {
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
    this.setEncodeOnly(true)

    // create internal hash encoder instance
    this._hashEncoder = new HashEncoder()
    const defaultAlgorithm = this._hashEncoder.getSettingValue('algorithm')
    const algorithms = this._hashEncoder.getSetting('algorithm').getElements()

    // register settings
    this.registerSetting([
      {
        name: 'key',
        type: 'bytes',
        value: new Uint8Array([99, 114, 121, 112, 116, 105, 105])
      },
      {
        name: 'algorithm',
        type: 'enum',
        value: defaultAlgorithm,
        randomizable: false,
        style: 'radio',
        options: {
          elements: algorithms
        }
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @param {Chain} content
   * @return {Chain|Promise} Encoded content
   */
  async performEncode (content) {
    const message = content.getBytes()

    // shorten keys longer than block size by sending it through the hash func
    let key = this.getSettingValue('key')
    if (key.length > 64) {
      key = await this.runHashFunction(key)
    }

    // keys shorter than block size are padded to block size
    const outerKey = new Uint8Array(64)
    outerKey.set(key, 0)

    // compose inner message and prepare outer key
    const innerMessage = new Uint8Array(64 + message.length)
    innerMessage.set(outerKey, 0)
    innerMessage.set(message, 64)

    for (let i = 0; i < 64; i++) {
      innerMessage[i] ^= 0x36
      outerKey[i] ^= 0x5C
    }

    // calculate inner digest
    const innerDigest = await this.runHashFunction(innerMessage)

    // compose outer message
    const outerMessage = new Uint8Array(64 + innerDigest.length)
    outerMessage.set(outerKey, 0)
    outerMessage.set(innerDigest, 64)

    // calculate hmac digest
    const result = await this.runHashFunction(outerMessage)
    return Chain.wrap(result)
  }

  /**
   * Runs hash function on given message using internal hash encoder.
   * @param {Uint8Array} message
   * @return {Promise}
   */
  async runHashFunction (message) {
    const digestChain = await this._hashEncoder.encode(Chain.wrap(message))
    return digestChain.getBytes()
  }

  /**
   * Triggered when a setting value has changed.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting, value) {
    if (setting.getName() === 'algorithm') {
      // set same algorithm on the internal hash encoder
      this._hashEncoder.setSettingValue('algorithm', value)
    }
    return super.settingValueDidChange(setting, value)
  }
}
