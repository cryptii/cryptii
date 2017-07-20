
import BrickView from './Brick'

/**
 * Viewer Brick View.
 */
export default class ViewerView extends BrickView {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('viewer')
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
    $action.innerText = 'View'
    $header.insertBefore($action, $header.firstChild)

    return $header
  }
}
