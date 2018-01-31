
import Chain from '../Chain'
import Encoder from '../Encoder'

const meta = {
  name: 'bitwise-operation',
  title: 'Bitwise Operation',
  category: 'Transform',
  type: 'encoder'
}

const operationInverseMap = {
  NOT: 'NOT',
  AND: 'NAND',
  OR: 'NOR',
  XOR: 'NXOR',
  NAND: 'AND',
  NOR: 'OR',
  NXOR: 'XOR'
}

/**
 * Encoder Brick for bitwise operations on bytes.
 */
export default class BitwiseOperationEncoder extends Encoder {
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
        name: 'operation',
        type: 'enum',
        value: 'NOT',
        options: {
          elements: [
            'NOT',
            'AND',
            'OR',
            'XOR',
            'NAND',
            'NOR',
            'NXOR'
          ],
          labels: [
            'NOT ~a',
            'AND (a & b)',
            'OR (a | b)',
            'XOR (a ^ b)',
            'NAND ~(a & b)',
            'NOR ~(a | b)',
            'NXOR ~(a ^ b)'
          ]
        }
      },
      {
        name: 'operand',
        label: 'Repeating Operand B',
        type: 'bytes',
        value: new Uint8Array([15]),
        visible: false,
        options: {
          minSize: 1
        }
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
    let bytes = content.getBytes()
    let operation = this.getSettingValue('operation')
    let operandBytes = this.getSettingValue('operand')

    if (!isEncode) {
      // inverse operation
      operation = operationInverseMap[operation]
    }

    // perform operation on each byte
    let result = bytes.map((byte, index) =>
      this.performByteOperation(byte, operation,
        operandBytes[index % operandBytes.length]))

    return Chain.wrap(result)
  }

  /**
   * Performs given bitwise operation on a single byte.
   * @protected
   * @param {number} byte
   * @param {string} operation
   * @param {?number} [operand=0]
   * @return {number}
   */
  performByteOperation (byte, operation, operand = 0) {
    switch (operation) {
      case 'NOT':
        return ~byte
      case 'AND':
        return byte & operand
      case 'OR':
        return byte | operand
      case 'XOR':
        return byte ^ operand
      case 'NAND':
        return ~(byte & operand)
      case 'NOR':
        return ~(byte | operand)
      case 'NXOR':
        return ~(byte ^ operand)
      default:
        return byte
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
    if (setting.getName() === 'operation') {
      // only make operand visible when necessary
      let operandSetting = this.getSetting('operand')
      operandSetting.setVisible(value !== 'NOT')
    }
    return super.settingValueDidChange(setting, value)
  }
}
