
import Viewer from '../Viewer'
import TextViewerView from '../View/Viewer/Text'

/**
 * Viewer Brick for creating a digest from given hash function and content.
 */
export default class HashViewer extends Viewer {
  /**
   * Brick constructor
   */
  constructor () {
    super()

    this._title = 'Hash'
    this._viewPrototype = TextViewerView

    let crypto = window.crypto || window.msCrypto
    this._cryptoSubtle = crypto.subtle || crypto.webkitSubtle

    this.registerSetting([
      {
        name: 'algorithm',
        type: 'enum',
        value: 'SHA-256',
        options: {
          elements: [
            'SHA-1',
            'SHA-256',
            'SHA-384',
            'SHA-512'
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
    let algorithm = this.getSettingValue('algorithm')

    // create hash digest from content
    this._cryptoSubtle.digest(algorithm, content.getBytes())

      // create hex string from buffer
      .then(buffer => {
        let view = new DataView(buffer)
        let hexString = ''
        for (let i = 0; i < view.byteLength; i += 4) {
          hexString += ('00000000' + view.getUint32(i).toString(16)).slice(-8)
        }
        return hexString
      })

      // send hash to view
      .then(hexString => {
        this.getView().setText(hexString)
        done()
      })

      // catch errors
      .catch(() => {
        // TODO handle error
        done()
      })
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // disable text input
    view.setDisabled(true)

    super.didCreateView(view)
  }
}
