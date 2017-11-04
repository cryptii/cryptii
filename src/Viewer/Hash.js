
import Browser from '../Browser'
import Viewer from '../Viewer'
import TextViewerView from '../View/Viewer/Text'

const meta = {
  name: 'hash',
  title: 'Hash function',
  category: 'Modern cryptography',
  type: 'viewer'
}

/**
 * Viewer Brick for creating a digest from given hash function and content.
 */
export default class HashViewer extends Viewer {
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

    let crypto = window.crypto || window.msCrypto
    this._cryptoSubtle = crypto.subtle || crypto.webkitSubtle

    this.registerSetting([
      {
        name: 'algorithm',
        type: 'enum',
        value: 'SHA-256',
        options: {
          elements: this._getAvailableAlgorithms()
        }
      }
    ])
  }

  /**
   * Performs view of given content.
   * @param {string} content
   * @param {function} done Called when performing view has finished.
   */
  performView (content, done) {
    let algorithm = this.getSettingValue('algorithm')

    // create hash digest from content
    let result = this._cryptoSubtle.digest(algorithm, content.getBytes())

    if (result.oncomplete !== undefined) {
      // wrap IE11 CryptoOperation object in a promise
      result = new Promise((resolve, reject) => {
        result.oncomplete = resolve.bind(this, result.result)
        result.onerror = reject
      })
    }

    result

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
      .catch(done)
  }

  /**
   * Returns digest algorithms available for the current browser.
   * @return {string[]}
   */
  _getAvailableAlgorithms () {
    let algorithms = [
      'SHA-1',
      'SHA-256',
      'SHA-384',
      'SHA-512'
    ]

    if (Browser.match('ie', 11)) {
      // only IE11 does not support SHA-512
      algorithms.splice(3, 1)
    }

    if (Browser.match('ie', 11) || Browser.match('edge')) {
      // SHA-1 does not work in ie and edge despite being documented differently
      algorithms.splice(0, 1)
    }

    return algorithms
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
