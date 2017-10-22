
import View from '../View'

/**
 * Setting View.
 */
export default class SettingView extends View {
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

    // apply updated element class name
    this.getElement().className = className
    return this
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
