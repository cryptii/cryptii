
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
    this._title = null
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

    let $footer = this.renderFooter()
    $footer && $root.appendChild($footer)

    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {?HTMLElement}
   */
  renderHeader () {
    let title = this.getModel().getTitle()

    let $removeBtn = document.createElement('a')
    $removeBtn.classList.add('brick__btn-remove')
    $removeBtn.innerText = 'Remove'
    $removeBtn.setAttribute('href', '#')
    $removeBtn.addEventListener('click', this.removeButtonDidClick.bind(this))

    let $header = document.createElement('header')
    $header.classList.add('brick__header')
    $header.innerHTML = `<h3 class="brick__title">${title}</h3>`
    $header.appendChild($removeBtn)

    return $header
  }

  /**
   * Renders settings.
   * @protected
   * @return {?HTMLElement}
   */
  renderSettings () {
    let $settings = document.createElement('div')
    $settings.classList.add('brick__settings')
    return $settings
  }

  /**
   * Renders content.
   * @protected
   * @return {?HTMLElement}
   */
  renderContent () {
    let $content = document.createElement('div')
    $content.classList.add('brick__content')
    return $content
  }

  /**
   * Renders footer.
   * @protected
   * @return {?HTMLElement}
   */
  renderFooter () {
    let $footer = document.createElement('footer')
    $footer.classList.add('brick__footer')
    return $footer
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
   * Triggered when the remove btn has been clicked.
   * @param {Event} evt
   */
  removeButtonDidClick (evt) {
    this.getModel().viewRemoveButtonDidClick(this)
    evt.preventDefault()
  }
}
