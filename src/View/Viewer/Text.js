
import ViewerView from '../Viewer'

/**
 * TextViewer Brick View.
 */
export default class TextViewerView extends ViewerView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._text = ''
    this._$textarea = null
  }

  /**
   * Returns text.
   * @return {string}
   */
  getText () {
    return this._text
  }

  /**
   * Sets text.
   * @param {string} string
   * @return {ViewerView} Fluent interface
   */
  setText (text) {
    if (this._text !== text) {
      this._text = text

      if (this._$textarea !== null) {
        this._$textarea.value = text
        this.layoutTextarea()
      }
    }
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('viewer-text')
    return $root
  }

  /**
   * Renders content.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderContent () {
    this._$textarea = document.createElement('textarea')
    this._$textarea.classList.add('viewer-text__textarea')
    this._$textarea.setAttribute('spellcheck', 'false')
    this._$textarea.value = this._text

    this._$textarea.addEventListener(
      'input', this.textareaValueDidChange.bind(this), false)

    let $content = super.renderContent()
    $content.appendChild(this._$textarea)
    return $content
  }

  /**
   * Triggered when textarea value changed.
   * @protected
   * @param {Event} evt
   */
  textareaValueDidChange (evt) {
    let text = this._$textarea.value

    if (this._text !== text) {
      this._text = text

      // notify model about text change
      this.getModel().textViewerViewTextDidChange(this, this._text)

      this.layoutTextarea()
    }
  }

  /**
   * Calculates height nessesary to view the text without scrollbars.
   * @protected
   * @return {TextViewerView} Fluent interface
   */
  layoutTextarea () {
    this._$textarea.style.height = ''
    this._$textarea.style.height = this._$textarea.scrollHeight + 'px'
    return this
  }
}
