import StringUtil from '../StringUtil.js'
import View from '../View.js'

/**
 * Field view
 */
export default class FieldView extends View {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$message = null
    this._message = null
    this._id = StringUtil.uniqueId()
    this._first = false
  }

  /**
   * Returns wether this field is the first in a row.
   * @return {boolean}
   */
  isFirst () {
    return this._first
  }

  /**
   * Sets wether this field is the first in a row.
   * @param {boolean}
   * @return {Field} Fluent interface
   */
  setFirst (first) {
    if (this._first !== first) {
      this._first = first
      if (first) {
        this.getElement().classList.add('field--first')
      } else {
        this.getElement().classList.remove('field--first')
      }
    }
    return this
  }

  /**
   * Returns the current message, if any.
   * @protected
   * @return {?string} Message or null
   */
  getMessage () {
    return this._message
  }

  /**
   * Sets the message.
   * @protected
   * @param {?string} message
   * @return {FieldView} Fluent interface
   */
  setMessage (message) {
    this._message = message
    return this.update()
  }

  /**
   * Clears the message.
   * @protected
   * @return {FieldView} Fluent interface
   */
  clearMessage () {
    return this.setMessage(null)
  }

  /**
   * Returns field id.
   * @return {string}
   */
  getId () {
    return this._id
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    return View.createElement('div', {
      className: 'field' + (this._first ? ' field--first' : '')
    }, [
      this.renderLabel(),
      this.renderField()
    ])
  }

  /**
   * Renders label.
   * @protected
   * @return {?HTMLElement}
   */
  renderLabel () {
    return View.createElement('label', {
      className: 'field__label',
      htmlFor: this.getId()
    }, this.getModel().getLabel())
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    return View.createElement('div', {
      className: 'field__field'
    })
  }

  /**
   * Renders message.
   * @protected
   * @return {?HTMLElement}
   */
  renderMessage () {
    if (this.getMessage() !== null) {
      return View.createElement('div', {
        className: 'field__message'
      }, this.getMessage())
    }
    return null
  }

  /**
   * Triggered after rendering root element.
   */
  didRender () {
    super.didRender()
    // Update value initially
    this.updateValue()
  }

  /**
   * Updates view on model change.
   * @return {FieldView} Fluent interface
   */
  update () {
    const $field = this.getElement()

    // Set width attr
    $field.dataset.width = this.getModel().getWidth()

    // Set focus modifier
    if (this.hasFocus()) {
      $field.classList.add('field--focus')
    } else {
      $field.classList.remove('field--focus')
    }

    // Add invalid modifier
    if (!this.getModel().isValid() || this.getMessage() !== null) {
      $field.classList.add('field--invalid')
    } else {
      $field.classList.remove('field--invalid')
    }

    // Remove old message, if any
    if (this._$message !== null && this._$message.parentNode !== null) {
      this._$message.parentNode.removeChild(this._$message)
    }
    this._$message = null

    // Create new message, if any
    this._$message = this.renderMessage()
    if (this._$message !== null) {
      this.getElement().appendChild(this._$message)
    }

    return this
  }

  /**
   * Triggered when view receives focus.
   */
  didFocus () {
    this.getElement().classList.add('field--focus')
  }

  /**
   * Triggered when view loses focus.
   */
  didBlur () {
    this.getElement().classList.remove('field--focus')
  }

  /**
   * Retrieves value from model and updates it in view.
   * @override
   * @return {FieldView} Fluent interface
   */
  updateValue () {
    // Nothing to do
    return this
  }
}
