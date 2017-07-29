
import Chain from '../Chain'
import TextViewerView from '../View/Viewer/Text'
import Viewer from '../Viewer'

/**
 * Viewer Brick for viewing and editing content as plain text.
 */
export default class TextViewer extends Viewer {
  /**
   * Brick constructor
   */
  constructor () {
    super()
    this._title = 'Text'
    this._viewPrototype = TextViewerView
  }

  /**
   * Performs view of given content.
   * @protected
   * @param {string} content
   * @param {function} done Called when performing view has finished.
   */
  performView (content, done) {
    this.getView().setText(content.getString())
    done()
  }

  /**
   * Triggered when the text has been changed inside the view.
   * @protected
   * @param {TextViewerView} view
   * @param {string} text
   */
  viewTextDidChange (view, text) {
    let content = new Chain(text)
    this.contentDidChange(content)
  }
}
