
import BrickView from './Brick'

/**
 * Encoder Brick View.
 */
export default class EncoderView extends BrickView {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('encoder')
    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderHeader () {
    let $header = super.renderHeader()

    let $action = document.createElement('span')
    $action.classList.add('brick__action')
    $action.innerText = 'Encode'
    $header.insertBefore($action, $header.firstChild)

    return $header
  }
}
