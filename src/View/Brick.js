
import View from '../View'

/**
 * Brick View.
 */
export default class BrickView extends View {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = document.createElement('article')
    $root.classList.add('brick')

    let $header = this.renderHeader()
    $header && $root.appendChild($header)

    let $settings = this.renderSettings()
    $settings && $root.appendChild($settings)

    let $content = this.renderContent()
    $content && $root.appendChild($content)

    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderHeader () {
    let $header = document.createElement('header')
    $header.classList.add('brick__header')
    $header.innerHTML = `
      <h3 class="brick__title">Brick</h3>
    `
    return $header
  }

  /**
   * Renders settings.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderSettings () {
    let $settings = document.createElement('div')
    $settings.classList.add('brick__settings')
    return $settings
  }

  /**
   * Renders content.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderContent () {
    let $content = document.createElement('div')
    $content.classList.add('brick__content')
    return $content
  }

  /**
   * Returns Brick object owning this view.
   * @return {Brick}
   */
  getBrick () {
    return this._delegate
  }
}
