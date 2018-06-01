
import StringUtil from '../StringUtil'
import View from '../View'

/**
 * Setting view
 */
export default class SettingView extends View {
  /**
   * Constructor
   */
  constructor (factory) {
    super(factory)
    this._$message = null
    this._message = null
    this._id = StringUtil.uniqueId()
  }

  /**
   * Returns setting appearance.
   * @return {string}
   */
  getStyle () {
    return this._style
  }

  /**
   * Sets the setting appearance.
   * @param {string} style
   * @return {Setting} Fluent interface
   */
  setStyle (style) {
    if (this._style !== style) {
      this._style = style
      this.refresh()
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
   * @return {SettingView} Fluent interface
   */
  setMessage (message) {
    this._message = message
    return this.update()
  }

  /**
   * Clears the message.
   * @protected
   * @return {SettingView} Fluent interface
   */
  clearMessage () {
    return this.setMessage(null)
  }

  /**
   * Returns setting id.
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
      className: 'setting'
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
      className: 'setting__label',
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
      className: 'setting__field'
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
        className: 'setting__message'
      }, this.getMessage())
    }
    return null
  }

  /**
   * Triggered after rendering root element.
   */
  didRender () {
    super.didRender()
    // update value initially
    this.updateValue()
  }

  /**
   * Updates view on model change.
   * @return {SettingView} Fluent interface
   */
  update () {
    const $setting = this.getElement()

    // set width attr
    $setting.dataset.width = this.getModel().getWidth()

    // set focus modifier
    $setting.classList.toggle('setting--focus', this.hasFocus())

    // add invalid modifier
    $setting.classList.toggle('setting--invalid',
      !this.getModel().isValid() || this.getMessage() !== null)

    // remove old message, if any
    if (this._$message !== null) {
      this._$message.remove()
      this._$message = null
    }

    // create new message, if any
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
    this.getElement().classList.add('setting--focus')
  }

  /**
   * Triggered when view loses focus.
   */
  didBlur () {
    this.getElement().classList.remove('setting--focus')
  }

  /**
   * Retrieves value from model and updates it in view.
   * @override
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    // nothing to do
    return this
  }
}
