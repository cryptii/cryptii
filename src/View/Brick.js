
import View from '../View'
import SettingView from './Setting'

/**
 * Brick View.
 */
export default class BrickView extends View {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$settings = null
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = document.createElement('div')
    $root.classList.add('brick')

    let $header = this.renderHeader()
    $header && $root.appendChild($header)

    this._$settings = this.renderSettings()
    this._$settings && $root.appendChild(this._$settings)

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
   * Injects subview's root element into own DOM structure.
   * @protected
   * @param {View} view
   * @return {View} Fluent interface
   */
  appendSubviewElement (view) {
    if (view instanceof SettingView) {
      this.getElement()
      this._$settings.appendChild(view.getElement())
      return this
    }
    return super.appendSubviewElement(view)
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
}
