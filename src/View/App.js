
import View from '../View'

/**
 * Pipe View.
 */
export default class AppView extends View {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    // use existing element
    return document.querySelector('.app')
  }
}
