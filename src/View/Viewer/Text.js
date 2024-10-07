import ViewerView from '../Viewer.js'
import View from '../../View.js'

/**
 * Text viewer view
 */
export default class TextViewerView extends ViewerView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._text = ''
    this._disabled = false
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
   * @param {string} text
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
   * Returns wether input is disabled.
   * @return {boolean}
   */
  isDisabled () {
    return this._disabled
  }

  /**
   * Sets wether input is disabled.
   * @param {boolean} disabled
   * @return {TextViewerView} Fluent interface
   */
  setDisabled (disabled) {
    this._disabled = disabled
    if (this._$textarea !== null) {
      if (disabled) {
        this._$textarea.disabled = 'disabled'
      } else {
        this._$textarea.removeAttribute('disabled')
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
    const $root = super.render()
    $root.classList.add('viewer-text')
    return $root
  }

  /**
   * Renders content.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderContent () {
    this._$textarea = View.createElement('textarea', {
      className: 'viewer-text__textarea',
      ariaLabel: 'Content',
      spellcheck: false,
      value: this._text,
      onInput: this.textareaValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    if (this.isDisabled()) {
      this._$textarea.disabled = 'disabled'
    }

    const $content = super.renderContent()
    $content.appendChild(this._$textarea)
    return $content
  }

  /**
   * Triggered when textarea value changed.
   * @protected
   * @param {Event} evt
   */
  textareaValueDidChange (evt) {
    if (this.isDisabled()) {
      evt.preventDefault()
      return false
    }

    const text = this._$textarea.value

    if (this._text !== text) {
      this._text = text

      // notify model about text change
      this.getModel().viewTextDidChange(this, this._text)

      this.layoutTextarea()
    }
  }

  /**
   * Layouts view and its subviews.
   * @return {View}
   */
  layout () {
    this.layoutTextarea()
    return super.layout()
  }

  /**
   * Calculates height nessesary to view the text without scrollbars.
   * @protected
   * @return {TextViewerView} Fluent interface
   */
  layoutTextarea () {
    this._$textarea.style.height = ''
    this._$textarea.style.height = `${this._$textarea.scrollHeight}px`
    return this
  }

  /**
   * Updates view on model change.
   * @return {View} Fluent interface
   */
  update () {
    // Update status
    const error = this.getModel().getError()
    if (error !== null) {
      return this.updateStatus(
        'error',
        'Binary content can\'t be interpreted as text. ' +
        'Try switching to the bytes view. ' +
        error.message
      )
    } else {
      return this.updateStatus(null)
    }
  }
}
