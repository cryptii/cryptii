
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
    let $root = document.createElement('div')
    $root.classList.add('setting')

    let width = this.getModel().getWidth()
    width < 12 && $root.classList.add('setting--width-' + width)

    let $label = document.createElement('span')
    $label.classList.add('setting__label')
    $label.innerText = this.getModel().getLabel()
    $root.appendChild($label)

    return $root
  }
}
