
import View from '../View'

/**
 * Setting View.
 */
export default class SettingView extends View {
  /**
   * Constructor
   */
  constructor (factory) {
    super(factory)
    this._$message = null
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
      className: 'setting__label'
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
    if (this.getModel().getMessage() === null) {
      return null
    }
    return View.createElement('div', {
      className: 'setting__message'
    }, this.getModel().getMessage())
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
    let className = 'setting'

    if (this.hasFocus()) {
      className += ' setting--focus'
    }

    // add width modifier
    let width = this.getModel().getWidth()
    if (width < 12) {
      className += ` setting--width-${width}`
    }

    // add invalid modifier
    let valid = this.getModel().isValid()
    if (!valid) {
      className += ' setting--invalid'
    }

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

    // apply updated element class name
    this.getElement().className = className
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
