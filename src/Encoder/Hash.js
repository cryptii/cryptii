import EnvUtil from '../EnvUtil.js'
import Encoder from '../Encoder.js'
import md5 from './Hash/md5.js'
import nodeCrypto from 'node:crypto'

const meta = {
  name: 'hash',
  title: 'Hash function',
  category: 'Modern cryptography',
  type: 'encoder'
}

const algorithms = [
  {
    name: 'md5',
    label: 'MD5',
    blockSize: 64,
    available: true
  },
  {
    name: 'sha1',
    label: 'SHA-1',
    blockSize: 64,
    browserAlgorithm: 'SHA-1',
    nodeAlgorithm: 'sha1'
  },
  {
    name: 'sha256',
    label: 'SHA-256',
    blockSize: 64,
    browserAlgorithm: 'SHA-256',
    nodeAlgorithm: 'sha256'
  },
  {
    name: 'sha384',
    label: 'SHA-384',
    blockSize: 128,
    browserAlgorithm: 'SHA-384',
    nodeAlgorithm: 'sha384'
  },
  {
    name: 'sha512',
    label: 'SHA-512',
    blockSize: 128,
    browserAlgorithm: 'SHA-512',
    nodeAlgorithm: 'sha512'
  }
]

/**
 * Encoder brick for creating message digests
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

    const algorithms = HashEncoder.filterAvailableAlgorithms()
    this.addSetting({
      name: 'algorithm',
      type: 'enum',
      value: 'sha256',
      elements: algorithms.map(algorithm => algorithm.name),
      labels: algorithms.map(algorithm => algorithm.label),
      randomizable: false,
      style: 'radio'
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    const algorithmName = this.getSettingValue('algorithm')
    return this.createDigest(algorithmName, content.getBytes())
  }

  /**
   * Creates message digest using given algorithm.
   * @protected
   * @param {string} name Algorithm name
   * @param {Uint8Array} message Message bytes
   * @return {Promise}
   */
  createDigest (name, message) {
    const algorithm = algorithms.find(algorithm => algorithm.name === name)

    switch (name) {
      case 'md5':
        return new Promise(resolve => resolve(md5(message)))
    }

    if (EnvUtil.isNode()) {
      // Create message digest using Node Crypto async
      return new Promise((resolve, reject) => {
        const resultBuffer =
          nodeCrypto.createHash(algorithm.nodeAlgorithm)
            .update(global.Buffer.from(message))
            .digest()
        resolve(new Uint8Array(resultBuffer))
      })
    } else {
      // Get crypto subtle instance
      const crypto = window.crypto || window.msCrypto
      const cryptoSubtle = crypto.subtle || crypto.webkitSubtle

      // Create message digest using Web Crypto Api
      let result = cryptoSubtle.digest(algorithm.browserAlgorithm, message)

      // IE11 exception
      if (result.oncomplete !== undefined) {
        // Wrap IE11 CryptoOperation object in a promise
        result = new Promise((resolve, reject) => {
          result.oncomplete = resolve.bind(this, result.result)
          result.onerror = reject
        })
      }

      return result.then(buffer => new Uint8Array(buffer))
    }
  }

  /**
   * Returns algorithm objects available in the current environment.
   * @protected
   * @return {object[]}
   */
  static filterAvailableAlgorithms () {
    const isNode = EnvUtil.isNode()
    return algorithms.filter(algorithm => {
      // Algorithm availability not bound to the environment
      if (algorithm.available === true) {
        return true
      }

      // Browser environment
      if (!isNode && algorithm.browserAlgorithm !== undefined) {
        return true
      }

      // Node environment
      if (isNode && algorithm.nodeAlgorithm !== undefined) {
        return true
      }

      return false
    })
  }

  /**
   * Returns block size (in bytes) for given algorithm name.
   * @param {string} name Algorithm name
   * @return {int|null} Block size integer or null, if algorithm is not defined
   */
  static getAlgorithmBlockSize (name) {
    const algorithm = algorithms.find(algorithm => algorithm.name === name)
    return algorithm !== undefined ? algorithm.blockSize : null
  }
}
