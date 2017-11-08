
import Browser from '../Browser'
import Encoder from '../Encoder'

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

    let crypto = window.crypto || window.msCrypto
    this._cryptoSubtle = crypto.subtle || crypto.webkitSubtle

    this.registerSetting([
      {
        name: 'algorithm',
        type: 'enum',
        value: 'SHA-256',
        options: {
          elements: this.getAvailableAlgorithms()
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

    // create hash digest from content
    let result = this._cryptoSubtle.digest(algorithm, content.getBytes())

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
  getAvailableAlgorithms () {
    let algorithms = [
      'SHA-1',
      'SHA-256',
      'SHA-384',
      'SHA-512'
    ]

    if (Browser.match('ie', 11)) {
      // only IE11 does not support SHA-512
      algorithms.splice(3, 1)
    }

    if (Browser.match('ie', 11) || Browser.match('edge')) {
      // SHA-1 does not work in ie and edge despite being documented differently
      algorithms.splice(0, 1)
    }

    return algorithms
  }
}
