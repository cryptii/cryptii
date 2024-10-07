import ByteEncoder from '../ByteEncoder.js'
import Chain from '../Chain.js'
import StringUtil from '../StringUtil.js'
import TextViewerView from '../View/Viewer/Text.js'
import Viewer from '../Viewer.js'

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
    this.addSettings([
      {
        name: 'format',
        type: 'enum',
        width: 6,
        value: 'hexadecimal',
        elements: ['hexadecimal', 'binary'],
        labels: ['Hexadecimal', 'Binary'],
        randomizable: false
      },
      {
        name: 'groupBits',
        label: 'Group by',
        type: 'enum',
        width: 6,
        value: 8,
        elements: [null, 4, 5, 6, 8, 16, 24, 32],
        labels: [
          'None',
          '4 Bits',
          '5 Bits',
          '6 Bits',
          'Byte',
          '2 Bytes',
          '3 Bytes',
          '4 Bytes'
        ],
        randomizable: false
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

    // Encode bytes to string
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

    // Group result
    const groupBits = this.getSettingValue('groupBits')
    if (groupBits !== null) {
      const groupChars = groupBits / charBits
      string = StringUtil.chunk(string, groupChars).join(' ')
    }

    // Show it
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

      // Ignore whitespaces
      string = string.replace(/\s/g, '')

      // Decode string to bytes
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

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    if (setting.getName() === 'groupBits') {
      const formatSetting = this.getSetting('format')

      // Compose format options
      const formatNames = ['binary']
      const formatLabels = ['Binary']

      // The hexadecimal format is only available
      // if bits are grouped by multiples of 4
      if (value === null || value % 4 === 0) {
        formatNames.push('hexadecimal')
        formatLabels.push('Hexadecimal')
      }

      // Switch format if it is no longer available
      if (formatNames.indexOf(formatSetting.getValue()) === -1) {
        formatSetting.setValue(formatNames[0])
      }

      // Update format selection
      formatSetting.setElements(formatNames, formatLabels)
    }
  }
}
