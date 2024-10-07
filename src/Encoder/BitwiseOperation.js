import Encoder from '../Encoder.js'

const meta = {
  name: 'bitwise-operation',
  title: 'Bitwise operation',
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
 * Encoder brick for bitwise operations on bytes
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
    this.addSettings([
      {
        name: 'operation',
        type: 'enum',
        value: 'NOT',
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
        ],
        randomizable: false,
        style: 'radio'
      },
      {
        name: 'operand',
        label: 'Operand B (Repeating)',
        type: 'bytes',
        value: new Uint8Array([15]),
        minSize: 1,
        visible: false
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const bytes = content.getBytes()
    const operandBytes = this.getSettingValue('operand')
    let operation = this.getSettingValue('operation')

    if (!isEncode) {
      // Inverse operation
      operation = operationInverseMap[operation]
    }

    // Perform operation on each byte
    return bytes.map((byte, index) =>
      this.performByteOperation(byte, operation,
        operandBytes[index % operandBytes.length]))
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
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    if (setting.getName() === 'operation') {
      // Only make operand visible when necessary
      this.getSetting('operand').setVisible(value !== 'NOT')
    }
  }
}
