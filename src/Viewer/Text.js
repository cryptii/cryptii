import Chain from '../Chain.js'
import TextViewerView from '../View/Viewer/Text.js'
import Viewer from '../Viewer.js'

const meta = {
  name: 'text',
  title: 'Text',
  category: 'View',
  type: 'viewer'
}

/**
 * Viewer brick for viewing and editing content as plain text
 */
export default class TextViewer extends Viewer {
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
  }

  /**
   * Performs view of given content.
   * @protected
   * @param {string} content
   * @return {void|Promise} Resolves when completed.
   */
  async performView (content) {
    this.getView().setText(content.getString())
  }

  /**
   * Triggered when the text has been changed inside the view.
   * @protected
   * @param {TextViewerView} view
   * @param {string} text
   */
  viewTextDidChange (view, text) {
    this.dare(() => {
      this.contentDidChange(Chain.wrap(text))
    })
  }
}
