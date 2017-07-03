
import View from '../View'

/**
 * Brick View.
 */
export default class BrickView extends View {
  /**
   * Builds view.
   * @return {BrickView} Fluent interface
   */
  build () {
    let $root = document.createElement('div')
    $root.classList.add('brick')

    this._$root = $root
    return this
  }
}
