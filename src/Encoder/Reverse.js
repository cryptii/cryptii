
import Chain from '../Chain'
import Encoder from '../Encoder'

const meta = {
  name: 'reverse',
  title: 'Reverse',
  category: 'Transform',
  type: 'encoder'
}

/**
 * Encoder brick for reversing bytes, characters, words or lines
 */
export default class ReverseEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  async initAsync() {
    await super.initAsync()
    await this.addSetting({
      name: 'type',
      label: 'By',
      type: 'enum',
      value: 'character',
      elements: [
        'byte',
        'character',
        'line'
      ],
      labels: [
        'Byte',
        'Character',
        'Line'
      ],
      randomizable: false,
      style: 'radio'
    })
    return this
  }

  /**
   * Performs encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content, isEncode) {
    switch (this.getSettingValue('type')) {
      case 'byte':
        return content.getBytes().reverse()

      case 'character':
        return Chain.join(content.getChars().reverse(), '')

      case 'line':
        return Chain.join(content.split(/\r?\n/).reverse(), '\n')
    }
  }
}
