
import View from '../View'

/**
 * Setting View.
 */
export default class SettingView extends View {
  /**
   * Retrieves value from model and updates it in view.
   * @override
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    // nothing to do
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = document.createElement('div')
    $root.classList.add('setting')

    let width = this.getModel().getWidth()
    width < 12 && $root.classList.add('setting--width-' + width)

    let $label = this.renderLabel()
    $label && $root.appendChild($label)

    let $field = this.renderField()
    $field && $root.appendChild($field)

    return $root
  }

  /**
   * Renders label.
   * @protected
   * @return {?HTMLElement}
   */
  renderLabel () {
    let $label = document.createElement('label')
    $label.classList.add('setting__label')
    $label.innerText = this.getModel().getLabel()
    return $label
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    let $field = document.createElement('div')
    $field.classList.add('setting__field')
    return $field
  }

  /**
   * Triggered after rendering root element.
   */
  didRender () {
    // update value initially
    this.updateValue()
  }
}
