
import Browser from '../Browser'
import Chain from '../Chain'
import Encoder from '../Encoder'
import InvalidInputError from '../Error/InvalidInput'
// import md5 from './Hash/md5'
import nodeCrypto from 'crypto'

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
    blockSize: 128,
    keySize: 128,
    browserAlgorithm: 'aes',
    nodeAlgorithm: 'aes-128'
  },
  {
    name: 'aes-192',
    label: 'AES-192',
    blockSize: 128,
    keySize: 192,
    browserAlgorithm: 'aes',
    nodeAlgorithm: 'aes-192'
  },
  {
    name: 'aes-256',
    label: 'AES-256',
    blockSize: 128,
    keySize: 256,
    browserAlgorithm: 'aes',
    nodeAlgorithm: 'aes-256'
  }

]

const modes = [
  {
    name: 'ecb',
    label: 'ECB (Electronic Code Book)',
    needsIV: false
  },
  {
    name: 'cbc',
    label: 'CBC (Cipher Block Chaining)',
    needsIV: true
  },
  {
    name: 'ctr',
    label: 'CTR (Counter)',
    needsIV: true
  }
]

/**
 * Encoder brick for creating message digests
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

    const algorithms = BlockCipherEncoder.filterAvailableAlgorithms()
    this.registerSetting([
      {
        name: 'algorithm',
        type: 'enum',
        value: 'aes-128',
        randomizable: false,
        options: {
          elements: algorithms.map(algorithm => algorithm.name),
          labels: algorithms.map(algorithm => algorithm.label)
        }
      },
      {
        name: 'mode',
        type: 'enum',
        value: 'cbc',
        randomizable: false,
        options: {
          elements: modes.map(algorithm => algorithm.name),
          labels: modes.map(algorithm => algorithm.label)
        }
      },
      {
        name: 'key',
        type: 'bytes',
        value: new Uint8Array([
          0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
          0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c ]
        )
      },
      {
        name: 'iv',
        type: 'bytes',
        value: new Uint8Array([
          0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
          0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F ]
        )
      } /*,
      {
        name: 'pad',
        type: 'boolean',
        value: false
      } */

    ])
  }

  /**
   * Triggered when a setting value has changed.
   * Override is required to call super.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   */
  settingValueDidChange (setting, value) {
    super.settingValueDidChange(setting, value)

    if (setting.getName() === 'mode') {
      let ivSetting = this.getSetting('iv')
      const isVisible = (value !== 'ecb')
      ivSetting && ivSetting.setVisible(isVisible)
    }
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain|Promise} Resulting content
   */
  async performTranslate (content, isEncode) {
    const algorithmName = this.getSettingValue('algorithm')
    const modeName = this.getSettingValue('mode')

    const keyLength = BlockCipherEncoder.getAlgorithmKeySize(algorithmName) / 8
    const blockLength = BlockCipherEncoder.getAlgorithmBlockSize(algorithmName) / 8

    const key = this.getSettingValue('key')
    if (key.length !== keyLength) {
      throw new InvalidInputError(
        `Algorithm ${algorithmName} requires a key of '${keyLength}' bytes`)
    }

    let iv = this.getSettingValue('iv')
    if (BlockCipherEncoder.getModeNeedsIV(modeName)) {
      if (iv.length !== blockLength) {
        throw new InvalidInputError(
          `Algorithm ${algorithmName}-${modeName} requires an IV of '${blockLength}' bytes`)
      }
    } else {
      iv = null
    }

    const cipherText = await this.createCipher(algorithmName, modeName, key, iv, false, isEncode, content.getBytes())
    return Chain.wrap(cipherText)
  }

  /**
   * Creates message cipher using given algorithm.
   * @protected
   * @param {string} name Algorithm name
   * @param {Uint8Array} message Message bytes
   * @return {Promise}
   */
  createCipher (name, mode, key, iv, padding, isEncode, message) {
    const algorithm = algorithms.find(algorithm => algorithm.name === name)

    // console.log('ALGO: ' + name)
    // console.log('MODE: ' + mode)
    /* switch (name) {
      case 'md5':
        return new Promise(resolve => resolve(md5(message)))
    } */

    if (Browser.isNode()) {
      const cipherName = algorithm.nodeAlgorithm + '-' + mode

      // create message cipher using Node Crypto async
      return new Promise((resolve, reject) => {
        let cipher = isEncode
          ? nodeCrypto.createCipheriv(cipherName, key, iv)
          : nodeCrypto.createDecipheriv(cipherName, key, iv)

        cipher.setAutoPadding(padding)

        const resultBuffer = Buffer.concat([cipher.update(global.Buffer.from(message)), cipher.final()])
        resolve(new Uint8Array(resultBuffer))
      })
    } else {
      // get crypto subtle instance
      const crypto = window.crypto || window.msCrypto
      const cryptoSubtle = crypto.subtle || crypto.webkitSubtle

      const cipherName = algorithm.browserAlgorithm + '-' + mode
      const cryptoKey = cryptoSubtle.importKey(
        'raw',
        key,
        {
          name: cipherName
        },
        false,
        ['encrypt', 'decrypt']
      )

      // create message cipher using Web Crypto Api
      let result = cryptoKey.then((keyObj) => {
        let blockLength = algorithm.blockSize / 8

        if (mode === 'ecb') {
          return Promise.resolve(new Uint8Array(blockLength))
        }

        return cryptoSubtle.encrypt(
          {
            name: cipherName,
            iv: iv,
            counter: iv,
            length: blockLength
          },
          keyObj,
          message
        )
      })

      // IE11 exception
      if (result.oncomplete !== undefined) {
        // wrap IE11 CryptoOperation object in a promise
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
    const isNode = Browser.isNode()
    return algorithms.filter(algorithm => {
      // algorithm availability not bound to the environment
      if (algorithm.available === true) {
        return true
      }

      // browser environment
      if (!isNode && algorithm.browserAlgorithm !== undefined) {
        if (algorithm.browserExceptions !== undefined) {
          return !Browser.match.apply(Browser, algorithm.browserExceptions)
        }
        return true
      }

      // node environment
      if (isNode && algorithm.nodeAlgorithm !== undefined) {
        return true
      }

      return false
    })
  }

  /**
   * Returns block size (in bits) for given algorithm name.
   * @param {string} name Algorithm name
   * @return {int|null} Block size integer or null, if algorithm is not defined
   */
  static getAlgorithmBlockSize (name) {
    const algorithm = algorithms.find(algorithm => algorithm.name === name)
    return algorithm !== undefined ? algorithm.blockSize : null
  }

  /**
   * Returns key size (in bits) for given algorithm name.
   * @param {string} name Algorithm name
   * @return {int|null} Key size integer or null, if algorithm is not defined
   */
  static getAlgorithmKeySize (name) {
    const algorithm = algorithms.find(algorithm => algorithm.name === name)
    return algorithm !== undefined ? algorithm.keySize : null
  }

  /**
   * Returns whether an IV is required  for given mode name.
   * @param {string} name mode name
   * @return {boolean|null} IV required or null, if mode is not defined
   */
  static getModeNeedsIV (name) {
    const mode = modes.find(mode => mode.name === name)
    return mode !== undefined ? mode.needsIV : null
  }
}
