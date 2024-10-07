import Encoder from '../Encoder.js'

const meta = {
  name: 'rc4',
  title: 'RC4',
  category: 'Modern cryptography',
  type: 'encoder'
}

/**
 * Encoder brick for RC4 encryption
 */
export default class RC4Encoder extends Encoder {
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
    this.addSettings([
      {
        name: 'key',
        type: 'bytes',
        value: new Uint8Array([99, 114, 121, 112, 116, 105, 105]),
        minSize: 1,
        maxSize: 32,
        randomizeSize: 8
      },
      {
        name: 'drop',
        type: 'number',
        label: 'Drop bytes',
        value: 0,
        integer: true,
        min: 0,
        randomizable: false
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {Chain}
   */
  performTranslate (content, isEncode) {
    const key = this.getSettingValue('key')
    const drop = this.getSettingValue('drop')

    const keyLength = key.length
    const input = content.getBytes()
    const inputLength = input.length
    const result = new Uint8Array(inputLength)

    // Key-scheduling algorithm (KSA)
    const s = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      s[i] = i
    }

    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + key[i % keyLength]) % 256
      ;[s[i], s[j]] = [s[j], s[i]]
    }

    // Pseudo-random generation algorithm (PRGA)
    let i = 0
    j = 0

    let keyStreamByte
    for (let k = 0; k < drop + inputLength; k++) {
      i = (i + 1) % 256
      j = (j + s[i]) % 256
      ;[s[i], s[j]] = [s[j], s[i]]
      keyStreamByte = s[(s[i] + s[j]) % 256]

      if (k >= drop) {
        result[k - drop] = input[k - drop] ^ keyStreamByte
      }
    }

    return result
  }
}
