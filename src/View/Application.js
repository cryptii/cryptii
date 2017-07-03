
import View from '../View'

/**
 * Pipe View.
 */
export default class ApplicationView extends View {
  /**
   * Builds view.
   * @return {ApplicationView} Fluent interface
   */
  build () {
    // attach to existing element
    let $root = document.querySelector('.application')
    this._$root = $root
    return this
  }
}
