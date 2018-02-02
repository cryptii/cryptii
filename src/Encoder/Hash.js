
import Browser from '../Browser'
import Chain from '../Chain'
import Encoder from '../Encoder'
import md5 from './Hash/md5'

const meta = {
  name: 'hash',
  title: 'Hash function',
  category: 'Modern cryptography',
  type: 'encoder'
}

/**
 * Encoder Brick for creating a digest from given hash function and content.
 */
export default class HashEncoder extends Encoder {
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

    this.registerSetting([
      {
        name: 'algorithm',
        type: 'enum',
        value: 'SHA-256',
        style: 'radio',
        options: {
          elements: HashEncoder.getAvailableAlgorithms()
        }
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @param {Chain} content
   * @return {Chain|Promise} Encoded content
   */
  performEncode (content) {
    let algorithm = this.getSettingValue('algorithm')
    let bytes = content.getBytes()

    let result
    switch (algorithm) {
      case 'MD5':
        result = new Promise(resolve => resolve(md5(bytes)))
        break
      default:
        result = this.webCryptoDigest(algorithm, bytes)
    }

    return result.then(Chain.wrap)
  }

  /**
   * Creates message digest using web crypto api.
   * @protected
   * @param {string} algorithm
   * @param {Uint8Array} bytes
   * @return {Promise}
   */
  webCryptoDigest (algorithm, bytes) {
    let crypto = window.crypto || window.msCrypto
    let cryptoSubtle = crypto.subtle || crypto.webkitSubtle

    // create message digest from bytes
    let result = cryptoSubtle.digest(algorithm, bytes)

    if (result.oncomplete !== undefined) {
      // wrap IE11 CryptoOperation object in a promise
      result = new Promise((resolve, reject) => {
        result.oncomplete = resolve.bind(this, result.result)
        result.onerror = reject
      })
    }

    return result.then(buffer => new Uint8Array(buffer))
  }

  /**
   * Returns digest algorithms available for the current browser.
   * @protected
   * @return {string[]}
   */
  static getAvailableAlgorithms () {
    let algorithms = [
      'MD5',
      'SHA-1',
      'SHA-256',
      'SHA-384',
      'SHA-512'
    ]

    // IE11 does not support SHA-512
    if (Browser.match('ie', 11)) {
      algorithms.splice(4, 1)
    }

    // SHA-1 does not work in IE and edge despite being documented
    if (Browser.match('ie', 11) || Browser.match('edge')) {
      algorithms.splice(1, 1)
    }

    return algorithms
  }
}
