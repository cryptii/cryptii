
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
 * Viewer Brick for viewing and editing bytes.
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
   * Brick constructor
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
        options: {
          elements: [null, 4, 8, 16],
          labels: [
            'None',
            'Half-byte',
            'Byte',
            '2 Bytes'
          ]
        }
      }
    ])
  }

  /**
   * Performs view of given content.
   * @protected
   * @param {string} content
   * @param {function} done Called when performing view has finished.
   */
  performView (content, done) {
    let bytes = content.getBytes()
    let format = this.getSettingValue('format')

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
    let groupBits = this.getSettingValue('groupBits')
    if (groupBits !== null) {
      let groupChars = groupBits / charBits
      string = StringUtil.chunk(string, groupChars).join(' ')
    }

    // show it
    this.getView().setText(string)
    done()
  }

  /**
   * Triggered when the text has been changed inside the view.
   * @protected
   * @param {TextViewerView} view
   * @param {string} text
   */
  viewTextDidChange (view, text) {
    this.dare(() => {
      let string = text
      let format = this.getSettingValue('format')

      // decode string to bytes
      let bytes
      switch (format) {
        case 'hexadecimal':
          // ignore whitespaces
          string = string.replace(/\s/g, '')
          bytes = ByteEncoder.bytesFromHexString(string)
          break
        case 'binary':
          // ignore whitespaces
          string = string.replace(/\s/g, '')
          bytes = ByteEncoder.bytesFromBinaryString(string)
          break
      }
      this.contentDidChange(Chain.wrap(bytes))
    })
  }
}
