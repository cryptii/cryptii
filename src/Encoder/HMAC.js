
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
 * Encoder brick for creating HMAC digests using an underlying hash function
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
    const hashAlgorithmSetting = this._hashEncoder.getSetting('algorithm')

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
        value: hashAlgorithmSetting.getValue(),
        randomizable: false,
        style: 'radio',
        options: {
          elements: hashAlgorithmSetting.getElements(),
          labels: hashAlgorithmSetting.getElementLabels()
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
    const algorithm = this.getSettingValue('algorithm')
    const blockSize = HashEncoder.getAlgorithmBlockSize(algorithm)

    // shorten keys longer than block size by sending it through the hash func
    let key = this.getSettingValue('key')
    if (key.length > blockSize) {
      key = await this.createDigest(algorithm, key)
    }

    // keys shorter than block size are padded to block size
    const outerKey = new Uint8Array(blockSize)
    outerKey.set(key, 0)

    // compose inner message and prepare outer key
    const innerMessage = new Uint8Array(blockSize + message.length)
    innerMessage.set(outerKey, 0)
    innerMessage.set(message, blockSize)

    for (let i = 0; i < blockSize; i++) {
      innerMessage[i] ^= 0x36
      outerKey[i] ^= 0x5C
    }

    // calculate inner digest
    const innerDigest = await this.createDigest(algorithm, innerMessage)

    // compose outer message
    const outerMessage = new Uint8Array(blockSize + innerDigest.length)
    outerMessage.set(outerKey, 0)
    outerMessage.set(innerDigest, blockSize)

    // calculate hmac digest
    const result = await this.createDigest(algorithm, outerMessage)
    return Chain.wrap(result)
  }

  /**
   * Creates message digest using given algorithm.
   * @protected
   * @param {string} name Algorithm name
   * @param {Uint8Array} message Message bytes
   * @return {Promise}
   */
  async createDigest (name, message) {
    // lazily create internal hash encoder instance
    if (this._hashEncoder === null) {
      this._hashEncoder = new HashEncoder()
    }

    // configure algorithm
    this._hashEncoder.setSettingValue('algorithm', name)

    // create digest using hash encoder
    const digestChain = await this._hashEncoder.encode(Chain.wrap(message))
    return digestChain.getBytes()
  }
}
