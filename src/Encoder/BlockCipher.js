import EnvUtil from '../EnvUtil.js'
import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'
import nodeCrypto from 'node:crypto'

const meta = {
  name: 'block-cipher',
  title: 'Block Cipher',
  category: 'Modern cryptography',
  type: 'encoder'
}

const algorithms = [
  {
    name: 'aes-128',
    label: 'AES-128',
    blockSize: 16,
    keySize: 16,
    browserAlgorithm: 'aes',
    nodeAlgorithm: 'aes-128'
  },
  {
    name: 'aes-192',
    label: 'AES-192',
    blockSize: 16,
    keySize: 24,
    // Not widely supported in browsers
    browserAlgorithm: false,
    nodeAlgorithm: 'aes-192'
  },
  {
    name: 'aes-256',
    label: 'AES-256',
    blockSize: 16,
    keySize: 32,
    browserAlgorithm: 'aes',
    nodeAlgorithm: 'aes-256'
  }
]

const modes = [
  {
    name: 'ecb',
    label: 'ECB (Electronic Code Book)',
    hasIV: false,
    browserMode: false,
    nodeMode: true
  },
  {
    name: 'cbc',
    label: 'CBC (Cipher Block Chaining)',
    hasIV: true,
    browserMode: true,
    nodeMode: true
  },
  {
    name: 'ctr',
    label: 'CTR (Counter)',
    hasIV: true,
    browserMode: true,
    nodeMode: true
  }
]

/**
 * Encoder brick for block cipher encryption and decryption
 */
export default class BlockCipherEncoder extends Encoder {
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

    const algorithms = BlockCipherEncoder.getAlgorithms()
    const defaultAlgorithm = algorithms[0]
    const modes = BlockCipherEncoder.getModes()
    const paddingAvailable = BlockCipherEncoder.isPaddingAvailable()

    this.addSettings([
      {
        name: 'algorithm',
        type: 'enum',
        value: defaultAlgorithm.name,
        elements: algorithms.map(algorithm => algorithm.name),
        labels: algorithms.map(algorithm => algorithm.label),
        randomizable: false,
        width: paddingAvailable ? 8 : 12
      },
      {
        name: 'padding',
        type: 'boolean',
        value: false,
        randomizable: false,
        width: paddingAvailable ? 4 : 12,
        visible: paddingAvailable
      },
      {
        name: 'mode',
        type: 'enum',
        value: 'cbc',
        elements: modes.map(mode => mode.name),
        labels: modes.map(mode => mode.label),
        randomizable: false
      },
      {
        name: 'key',
        type: 'bytes',
        value: new Uint8Array([
          0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
          0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
        ]),
        minSize: defaultAlgorithm.keySize,
        maxSize: defaultAlgorithm.keySize
      },
      {
        name: 'iv',
        label: 'IV',
        type: 'bytes',
        value: new Uint8Array([
          0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
          0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
        ]),
        minSize: defaultAlgorithm.blockSize,
        maxSize: defaultAlgorithm.blockSize
      }
    ])
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'algorithm': {
        const { keySize } = BlockCipherEncoder.getAlgorithm(value)

        this.getSetting('key')
          .setMinSize(keySize)
          .setMaxSize(keySize)
        break
      }
      case 'mode': {
        const algorithm = this.getSettingValue('algorithm')
        const { blockSize } = BlockCipherEncoder.getAlgorithm(algorithm)
        const { hasIV } = BlockCipherEncoder.getMode(value)

        this.getSetting('iv')
          .setVisible(hasIV)
          .setMinSize(blockSize)
          .setMaxSize(blockSize)
        break
      }
    }
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  async performTranslate (content, isEncode) {
    const message = content.getBytes()
    const { algorithm, mode, key, padding, iv } = this.getSettingValues()

    try {
      // Try to encrypt or decrypt
      return await this.createCipher(
        algorithm, mode, key, iv, padding, isEncode, message)
    } catch (err) {
      // Catch invalid input errors
      if (!isEncode) {
        throw new InvalidInputError(
          `${algorithm} decryption failed, ` +
          'this may be due to malformed content')
      } else {
        throw new InvalidInputError(`${algorithm} encryption failed`)
      }
    }
  }

  /**
   * Creates message cipher using given algorithm.
   * @protected
   * @param {string} name Algorithm name
   * @param {Uint8Array} message Message bytes
   * @return {Promise}
   */
  async createCipher (name, mode, key, iv, padding, isEncode, message) {
    const algorithm = BlockCipherEncoder.getAlgorithm(name)

    const { hasIV } = BlockCipherEncoder.getMode(mode)
    if (!hasIV) {
      iv = new Uint8Array([])
    }

    if (EnvUtil.isNode()) {
      const cipherName = algorithm.nodeAlgorithm + '-' + mode

      // Node v8.x - convert Uint8Array to Buffer - not needed for v10
      iv = global.Buffer.from(iv)
      message = global.Buffer.from(message)

      // Create message cipher using Node Crypto async
      return new Promise((resolve, reject) => {
        const cipher = isEncode
          ? nodeCrypto.createCipheriv(cipherName, key, iv)
          : nodeCrypto.createDecipheriv(cipherName, key, iv)

        cipher.setAutoPadding(padding)

        const resultBuffer = Buffer.concat([
          cipher.update(message),
          cipher.final()
        ])

        resolve(new Uint8Array(resultBuffer))
      })
    } else {
      const cipherName = algorithm.browserAlgorithm + '-' + mode

      // Get crypto subtle instance
      const crypto = window.crypto || window.msCrypto
      const cryptoSubtle = crypto.subtle || crypto.webkitSubtle

      // Create key instance
      const cryptoKey = await cryptoSubtle.importKey(
        'raw', key, { name: cipherName }, false, ['encrypt', 'decrypt'])

      // Create message cipher using Web Crypto API
      const algo = {
        name: cipherName,
        iv,
        counter: iv,
        length: algorithm.blockSize
      }

      let result = isEncode
        ? cryptoSubtle.encrypt(algo, cryptoKey, message)
        : cryptoSubtle.decrypt(algo, cryptoKey, message)

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
   * Returns wether padding is available in the current environment.
   * @protected
   * @return {boolean}
   */
  static isPaddingAvailable () {
    return EnvUtil.isNode()
  }

  /**
   * Returns algorithm for given name.
   * @protected
   * @param {string} name Algorithm name
   * @return {?object} Algorithm object or null, if not found.
   */
  static getAlgorithm (name) {
    return algorithms.find(algorithm => algorithm.name === name)
  }

  /**
   * Returns algorithm objects available in the current environment.
   * @protected
   * @return {object[]}
   */
  static getAlgorithms () {
    const isNode = EnvUtil.isNode()
    return algorithms.filter(algorithm =>
      (algorithm.browserAlgorithm && !isNode) ||
      (algorithm.nodeAlgorithm && isNode)
    )
  }

  /**
   * Returns mode for given name.
   * @protected
   * @param {string} name Mode name
   * @return {?object} Mode object or null, if not found.
   */
  static getMode (name) {
    return modes.find(mode => mode.name === name)
  }

  /**
   * Returns mode objects available in the current environment.
   * @protected
   * @return {object[]}
   */
  static getModes () {
    const isNode = EnvUtil.isNode()
    return modes.filter(mode =>
      (mode.browserMode && !isNode) ||
      (mode.nodeMode && isNode)
    )
  }
}
