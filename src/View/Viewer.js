import BrickView from './Brick.js'
import View from '../View.js'

/**
 * Viewer brick view
 */
export default class ViewerView extends BrickView {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('viewer')
    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderHeader () {
    const $actions = View.createElement('ul', {
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

    const $header = super.renderHeader()
    $header.insertBefore($actions, $header.firstChild)
    return $header
  }
}
