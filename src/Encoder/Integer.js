
import Chain from '../Chain'
import Encoder from '../Encoder'
import InvalidInputError from '../Error/InvalidInput'

const meta = {
  name: 'integer',
  title: 'Integer',
  category: 'Data types',
  type: 'encoder'
}

const typeNames = ['U8', 'I8', 'U16', 'I16', 'U32', 'I32']
const typeBytes = [1, 1, 2, 2, 4, 4]

const typeLabels = [
  '8-bit unsigned integer (U8)',
  '8-bit signed integer (I8)',
  '16-bit unsigned integer (U16)',
  '16-bit signed integer (I16)',
  '32-bit unsigned integer (U32)',
  '32-bit signed integer (I32)'
]

/**
 * Encoder Brick translating between bytes and integers.
 */
export default class IntegerEncoder extends Encoder {
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
    this.registerSetting([
      {
        name: 'format',
        type: 'enum',
        value: 'decimal',
        priority: 30,
        options: {
          elements: [
            'binary',
            'octal',
            'decimal',
            'hexadecimal'
          ],
          labels: [
            'Binary',
            'Octal',
            'Decimal',
            'Hexadecimal'
          ]
        }
      },
      {
        name: 'type',
        type: 'enum',
        value: 'U8',
        style: 'radio',
        priority: 20,
        options: {
          elements: typeNames,
          labels: typeLabels
        }
      },
      {
        name: 'byteOrder',
        type: 'enum',
        value: 'big-endian',
        visible: false,
        priority: 10,
        options: {
          elements: [
            'little-endian',
            'big-endian'
          ],
          labels: [
            'Little-endian',
            'Big-endian'
          ]
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
    let typeName = this.getSettingValue('type')
    let typeIndex = typeNames.indexOf(typeName)
    let bytesPerInteger = typeBytes[typeIndex]
    let isBigEndian = this.getSettingValue('byteOrder') === 'big-endian'

    let size = content.getSize()
    if (size % bytesPerInteger !== 0) {
      size += bytesPerInteger - size % bytesPerInteger
    }

    let bytes = new Uint8Array(size)
    bytes.set(content.getBytes())

    // collect integers
    let integers = this.createIntegerTypeArray(size / bytesPerInteger, typeName)
    let integer = 0
    let i = 0
    while (i < bytes.length) {
      if (isBigEndian) {
        integer = (integer << 8) | bytes[i]
      } else {
        integer = integer | bytes[i] << (i % bytesPerInteger * 8)
      }
      if (++i % bytesPerInteger === 0) {
        integers[i / bytesPerInteger - 1] = integer
        integer = 0
      }
    }

    // convert integers to strings
    let format = this.getSettingValue('format')
    let integerStrings = []

    for (i = 0; i < integers.length; i++) {
      switch (format) {
        case 'binary':
          integerStrings.push(integers[i].toString(2))
          break
        case 'octal':
          integerStrings.push(integers[i].toString(8))
          break
        case 'decimal':
          integerStrings.push(integers[i].toString(10))
          break
        default:
          integerStrings.push(integers[i].toString(16))
      }
    }

    let string = integerStrings.join(' ')
    return Chain.wrap(string)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain|Promise} Decoded content
   */
  performDecode (content) {
    let typeName = this.getSettingValue('type')
    let typeIndex = typeNames.indexOf(typeName)
    let bytesPerInteger = typeBytes[typeIndex]
    let isBigEndian = this.getSettingValue('byteOrder') === 'big-endian'

    // read integers from string
    let format = this.getSettingValue('format')
    let integerStrings = content.getString().split(/\s+/)
    let integers = this.createIntegerTypeArray(integerStrings.length, typeName)

    let i, integer, integerString
    for (i = 0; i < integerStrings.length; i++) {
      // interpret empty integer strings as empty integers
      integerString = integerStrings[i]
      if (integerString === '') {
        integerString = '0'
      }

      // read format
      switch (format) {
        case 'binary':
          integer = parseInt(integerString, 2)
          break
        case 'octal':
          integer = parseInt(integerString, 8)
          break
        case 'decimal':
          integer = parseInt(integerString, 10)
          break
        default:
          integer = parseInt(integerString, 16)
      }

      // check if integer is valid
      if (isNaN(integer)) {
        throw new InvalidInputError(
          `Invalid integer '${integerString}' at index ${i}`)
      }
      integers[i] = integer
    }

    // write bytes
    let bytes = new Uint8Array(integers.length * bytesPerInteger)
    let integerByte
    for (i = 0; i < bytes.length; i++) {
      integer = integers[parseInt(i / bytesPerInteger)]
      integerByte = isBigEndian
        ? bytesPerInteger - i % bytesPerInteger - 1
        : i % bytesPerInteger
      bytes[i] = (integer >> (integerByte * 8)) & 0xff
    }

    return Chain.wrap(bytes)
  }

  /**
   * Creates integer array of given type.
   * @protected
   * @param {number} size
   * @param {string} typeName
   * @return {TypedArray}
   */
  createIntegerTypeArray (size, typeName) {
    switch (typeName) {
      case 'I8':
        return new Int8Array(size)
      case 'U8':
        return new Uint8Array(size)
      case 'I16':
        return new Int16Array(size)
      case 'U16':
        return new Uint16Array(size)
      case 'I32':
        return new Int32Array(size)
      default:
        return new Uint32Array(size)
    }
  }

  /**
   * Triggered when a setting value has changed.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'type':
        let typeIndex = typeNames.indexOf(this.getSettingValue('type'))
        let bytesPerInteger = typeBytes[typeIndex]
        this.getSetting('byteOrder').setVisible(bytesPerInteger > 1)
    }
    return super.settingValueDidChange(setting, value)
  }
}
