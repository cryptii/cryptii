
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
    this._$body = this.renderBody()
    this._$inner = View.createElement('div', {
      className: 'brick__inner'
    }, this._$body)

    return View.createElement('div', {
      className: 'brick'
    }, [
      this.renderHeader(),
      this._$inner
    ])
  }

  /**
   * Renders header.
   * @protected
   * @return {?HTMLElement}
   */
  renderHeader () {
    let title = this.getModel().getMeta().title
    return View.createElement('header', {
      className: 'brick__header'
    }, [
      View.createElement('h3', {
        className: 'brick__title'
      }, [
        View.createElement('a', {
          className: 'brick__btn-toggle',
          href: '#',
          onClick: evt => {
            evt.preventDefault()
            this.toggleSelection()
          }
        }, title)
      ]),
      View.createElement('a', {
        className: 'brick__btn-remove',
        href: '#',
        onClick: this.removeButtonDidClick.bind(this)
      }, 'Remove')
    ])
  }

  /**
   * Renders brick body.
   * @protected
   * @return {HTMLElement}
   */
  renderBody () {
    this._$settings = this.renderSettings()

    return View.createElement('div', {
      className: 'brick__page brick__body'
    }, [
      this._$settings,
      this.renderContent(),
      this.renderFooter()
    ])
  }

  /**
   * Renders settings.
   * @protected
   * @return {?HTMLElement}
   */
  renderSettings () {
    return View.createElement('div', {
      className: 'brick__settings'
    })
  }

  /**
   * Renders content.
   * @protected
   * @return {?HTMLElement}
   */
  renderContent () {
    return View.createElement('div', {
      className: 'brick__content'
    })
  }

  /**
   * Renders footer.
   * @protected
   * @return {?HTMLElement}
   */
  renderFooter () {
    return View.createElement('footer', {
      className: 'brick__footer'
    })
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

    return View.createElement('div', {
      className: 'brick__page brick__selection'
    }, selectionView.getElement())
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
   * Triggered when view receives focus.
   */
  didFocus () {
    this.getElement().classList.add('brick--focus')
  }

  /**
   * Triggered when view loses focus.
   */
  didBlur () {
    this.getElement().classList.remove('brick--focus')
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
