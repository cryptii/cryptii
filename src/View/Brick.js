
import SelectionView from './Selection'
import SettingView from './Setting'
import View from '../View'

/**
 * Brick View.
 */
export default class BrickView extends View {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$body = null
    this._$settings = null
    this._$selection = null
    this._selectionVisible = false
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

    this._$body = this.renderBody()

    this._$inner = document.createElement('div')
    this._$inner.classList.add('brick__inner')
    this._$inner.appendChild(this._$body)

    $root.appendChild(this._$inner)

    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {?HTMLElement}
   */
  renderHeader () {
    let title = this.getModel().getMeta().title

    let $removeBtn = document.createElement('a')
    $removeBtn.classList.add('brick__btn-remove')
    $removeBtn.innerText = 'Remove'
    $removeBtn.setAttribute('href', '#')
    $removeBtn.addEventListener('click', this.removeButtonDidClick.bind(this))

    let $toggleButton = document.createElement('a')
    $toggleButton.classList.add('brick__btn-toggle')
    $toggleButton.setAttribute('href', '#')
    $toggleButton.innerText = title
    $toggleButton.addEventListener('click', evt => {
      evt.preventDefault()
      this.toggleSelection()
    })

    let $title = document.createElement('h3')
    $title.classList.add('brick__title')
    $title.appendChild($toggleButton)

    let $header = document.createElement('header')
    $header.classList.add('brick__header')
    $header.appendChild($title)
    $header.appendChild($removeBtn)

    return $header
  }

  /**
   * Renders brick body.
   * @protected
   * @return {HTMLElement}
   */
  renderBody () {
    let $body = document.createElement('div')
    $body.classList.add('brick__page')
    $body.classList.add('brick__body')

    this._$settings = this.renderSettings()
    this._$settings && $body.appendChild(this._$settings)

    let $content = this.renderContent()
    $content && $body.appendChild($content)

    let $footer = this.renderFooter()
    $footer && $body.appendChild($footer)

    return $body
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
   * Renders brick selection.
   * @protected
   * @return {HTMLElement}
   */
  renderSelection () {
    let brickFactory = this.getModel().getPipe().getBrickFactory()
    let selectionView = new SelectionView(brickFactory)
    selectionView.setModel(this.getModel())

    let $selectionPage = document.createElement('div')
    $selectionPage.classList.add('brick__page')
    $selectionPage.classList.add('brick__selection')
    $selectionPage.appendChild(selectionView.getElement())
    return $selectionPage
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

      // get setting subviews
      let settingViews = this.getSubviews()
        .filter(view => view instanceof SettingView)

      // integrate new setting view
      settingViews.push(view)
      settingViews.sort((a, b) =>
        b.getModel().getPriority() - a.getModel().getPriority())

      // retrieve position of setting view we are integrating
      let index = settingViews.indexOf(view)
      let $referenceNode = index < settingViews.length - 1
        ? settingViews[index + 1].getElement()
        : null

      this._$settings.insertBefore(view.getElement(), $referenceNode)
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

  /**
   * Toggle selection view.
   * @param {boolean} [visible]
   */
  toggleSelection (visible = !this._selectionVisible) {
    if (this._selectionVisible !== visible) {
      this._selectionVisible = visible

      if (visible) {
        if (this._$selection === null) {
          // render selection lazily
          this._$selection = this.renderSelection()
          this._$selection.classList.add('brick__page--hidden')
          this._$inner.appendChild(this._$selection)
        }

        // wait until next js cycle to trigger transitions
        setTimeout(() => {
          this.getElement().classList.add('brick--selection')
          this._$body.classList.add('brick__page--hidden')
          this._$selection.classList.remove('brick__page--hidden')
        }, 0)
      } else {
        this.getElement().classList.remove('brick--selection')
        this._$body.classList.remove('brick__page--hidden')
        this._$selection.classList.add('brick__page--hidden')
      }
    }
  }
}
