
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
   * Views content.
   * @param {Chain} content
   * @return {Viewer} Fluent interface
   */
  view (content) {
    super.view(content)
    this.hasView() && this.getView().setText(content.getString())
    return this
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    super.didCreateView(view)
    this.hasView() && this.getView().setText(this.getContent().getString())
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
