
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
    return $root
  }
}
