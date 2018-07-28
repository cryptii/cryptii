
import ByteEncoder from '../ByteEncoder'
import Chain from '../Chain'
import StringUtil from '../StringUtil'
import TextViewerView from '../View/Viewer/Text'
import Viewer from '../Viewer'

const meta = {
  name: 'bytes',
  title: 'Bytes',
  category: 'View',
  type: 'viewer'
}

/**
 * Viewer brick for viewing and editing bytes
 */
export default class BytesViewer extends Viewer {
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
    this._viewPrototype = TextViewerView

    this.registerSetting([
      {
        name: 'format',
        type: 'enum',
        width: 6,
        value: 'hexadecimal',
        randomizable: false,
        options: {
          elements: [
            'hexadecimal',
            'binary'
          ],
          labels: [
            'Hexadecimal',
            'Binary'
          ]
        }
      },
      {
        name: 'groupBits',
        label: 'Group by',
        type: 'enum',
        width: 6,
        value: 8,
        randomizable: false,
        options: {
          elements: [null, 4, 8, 16, 32],
          labels: [
            'None',
            'Half-byte',
            'Byte',
            '2 Bytes',
            '4 Bytes'
          ]
        }
      }
    ])
  }

  /**
   * Performs view of given content.
   * @protected
   * @param {string} content
   * @return {void|Promise} Resolves when completed.
   */
  async performView (content) {
    const bytes = content.getBytes()
    const format = this.getSettingValue('format')

    // encode bytes to string
    let string, charBits
    switch (format) {
      case 'hexadecimal':
        string = ByteEncoder.hexStringFromBytes(bytes)
        charBits = 4
        break
      case 'binary':
        string = ByteEncoder.binaryStringFromBytes(bytes)
        charBits = 1
    }

    // group result
    const groupBits = this.getSettingValue('groupBits')
    if (groupBits !== null) {
      const groupChars = groupBits / charBits
      string = StringUtil.chunk(string, groupChars).join(' ')
    }

    // show it
    this.getView().setText(string)
  }

  /**
   * Triggered when the text has been changed inside the view.
   * @protected
   * @param {TextViewerView} view
   * @param {string} text
   */
  viewTextDidChange (view, text) {
    this.dare(() => {
      const format = this.getSettingValue('format')
      let string = text

      // ignore whitespaces
      string = string.replace(/\s/g, '')

      // decode string to bytes
      let bytes
      switch (format) {
        case 'hexadecimal':
          bytes = ByteEncoder.bytesFromHexString(string)
          break
        case 'binary':
          bytes = ByteEncoder.bytesFromBinaryString(string)
          break
      }
      this.contentDidChange(Chain.wrap(bytes))
    })
  }
}
