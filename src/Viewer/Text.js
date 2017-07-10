
import Viewer from '../Viewer'
import TextViewerView from '../View/Viewer/Text'

/**
 * Viewer Brick for viewing and editing content as plain text.
 */
export default class TextViewer extends Viewer {
  /**
   * Creates view.
   * @protected
   * @return {View} Newly created view.
   */
  createView () {
    return new TextViewerView()
  }

  /**
   * Triggered when the content got edited inside the view.
   * @param {TextViewerView} sender
   * @param {string} content New content
   * @return {TextViewer} Fluent interface
   */
  textViewerViewContentDidChange (sender, content) {
    this.contentDidChange(content)
    return this
  }
}
