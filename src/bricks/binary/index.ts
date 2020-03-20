
import BinaryEncoder from '../../library/Encoder/BinaryEncoder'
import Chain from '../../library/Chain'
import Field from '../../library/Field/Field'
import StringUtil from '../../library/Util/StringUtil'
import ViewerBrick from '../../library/Brick/ViewerBrick'

import TextViewerBrickView from '../../views/BrickViewerText'

/**
 * Viewer brick for viewing and editing bytes
 */
export default class BinaryViewer extends ViewerBrick {
  /**
   * React component this model is represented by
   */
  protected viewComponent = TextViewerBrickView

  /**
   * Brick title
   */
  protected title: string = 'Binary'

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSettings([
      {
        name: 'format',
        type: 'enum',
        width: 6,
        value: 'hexadecimal',
        elements: [
          { value: 'hexadecimal', label: 'Hexadecimal' },
          { value: 'binary', label: 'Binary' },
        ],
        randomizable: false
      },
      {
        name: 'groupBits',
        label: 'Group by',
        type: 'enum',
        width: 6,
        value: 8,
        elements: [
          { value: null, label: 'None' },
          { value: 4, label: '4 Bits' },
          { value: 5, label: '5 Bits' },
          { value: 6, label: '6 Bits' },
          { value: 7, label: '7 Bits' },
          { value: 8, label: 'Byte' },
          { value: 16, label: '2 Bytes' },
          { value: 24, label: '3 Bytes' },
          { value: 32, label: '4 Bytes' },
        ],
        randomizable: false
      }
    ])
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    const bytes = this.getContent().getBytes()

    // Encode bytes to string
    let string = ''
    let charBits = 1
    switch (this.settings.format) {
      case 'hexadecimal':
        string = BinaryEncoder.hexEncode(bytes)
        charBits = 4
        break
      case 'binary':
        // TODO: Respect bit padding when encoding
        string = BinaryEncoder.binaryEncode(bytes)
        charBits = 1
    }

    // Group result
    const groupBits = this.settings.groupBits
    if (groupBits !== null) {
      const groupChars = groupBits / charBits
      string = StringUtil.chunk(string, groupChars).join(' ')
    }

    return {
      ...super.compose(),
      content: string,
      onChange: this.viewTextDidChange.bind(this)
    }
  }

  /**
   * Triggered when the text has been changed inside the view.
   * @param value - New text value
   */
  viewTextDidChange (value: string) {
    this.dare(() => {
      // Ignore whitespaces
      value = value.replace(/\s/g, '')

      // Decode string to bytes
      let bytes
      switch (this.settings.format) {
        case 'hexadecimal':
          bytes = BinaryEncoder.hexDecode(value)
          break
        case 'binary':
          bytes = BinaryEncoder.binaryDecode(value)
          break
      }
      this.setContent(Chain.from(bytes), this)
    })
  }

  /**
   * Triggered when a setting field has changed.
   * @param setting - Sender setting field
   * @param value - New field value
   */
  settingValueDidChange (setting: Field, value: any) {
    if (setting.getName() === 'groupBits') {
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
      if (formatNames.indexOf(this.settings.format) === -1) {
        this.settings.format = formatNames[0]
      }

      // Update format selection
      this.settingFields.format.setElements(formatNames, formatLabels)
    }
  }
}
