
import BrickView from './Brick'
import View from '../View'

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
    let $actions = View.createElement('ul', {
      className: 'brick__actions'
    }, [
      View.createElement('li', {
        className: 'brick__action-item'
      }, [
        View.createElement('span', {
          className: 'brick__action brick__action--active'
        }, 'View')
      ])
    ])

    let $header = super.renderHeader()
    $header.insertBefore($actions, $header.firstChild)
    return $header
  }
}
