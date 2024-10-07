import View from '../View.js'

/**
 * App view
 */
export default class AppView extends View {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    // use existing element
    const $root = document.querySelector('.app')

    // bind events
    window.addEventListener('resize', this.windowDidResize.bind(this), false)

    return $root
  }

  /**
   * Triggered when the window has been resized.
   * @protected
   * @param {?Event} evt
   */
  windowDidResize (evt) {
    this.layout()
  }
}
