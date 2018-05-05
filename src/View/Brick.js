
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

    this._$menu = null
    this._$body = null
    this._$settings = null
    this._$status = null
    this._$message = null

    this._menuVisible = false
    this._menuHideHandler = this.toggleMenu.bind(this)

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
    this._$menu = this.renderMenu()
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
        className: 'brick__btn-menu',
        href: '#',
        onClick: evt => {
          evt.preventDefault()
          this.toggleMenu()
        }
      }, 'Brick menu'),
      this._$menu
    ])
  }

  /**
   * Renders menu.
   * @protected
   * @return {HTMLElement}
   */
  renderMenu () {
    let items = [
      {
        label: 'Remove',
        name: 'remove'
      },
      {
        label: 'Hide',
        name: 'hide'
      },
      {
        label: 'Randomize',
        name: 'randomize'
      }
    ]

    return View.createElement('div', {
      className: 'brick__menu menu'
    }, [
      View.createElement('ul', {
        className: 'menu__list'
      }, items.map(item =>
        View.createElement('li', {
          className: 'menu__item'
        }, [
          View.createElement('a', {
            className: 'menu__button',
            href: '#',
            onClick: evt => {
              evt.preventDefault()
              this.menuItemDidClick(item.name)
            }
          }, item.label)
        ])
      ))
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
      this.renderStatus()
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
   * Renders status.
   * @protected
   * @return {?HTMLElement}
   */
  renderStatus () {
    this._$message = View.createElement('div', {
      className: 'brick__status-message'
    })

    this._$status = View.createElement('footer', {
      className: 'brick__status'
    }, [
      View.createElement('div', {
        className: 'brick__status-icon'
      }),
      this._$message
    ])

    return this._$status
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
   * Toggles selection view.
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

  /**
   * Toggles menu.
   */
  toggleMenu () {
    this._menuVisible = !this._menuVisible
    this._$menu.classList.toggle('menu--visible', this._menuVisible)

    if (this._menuVisible) {
      // listen to the next window click to hide the menu again
      window.requestAnimationFrame(() => {
        window.addEventListener('click', this._menuHideHandler)
      })
    } else {
      // remove listener
      window.removeEventListener('click', this._menuHideHandler)
    }
  }

  /**
   * Triggered when menu item has been clicked.
   * @param {string} name Menu item name
   */
  menuItemDidClick (name) {
    switch (name) {
      case 'remove':
        this.getModel().viewRemoveMenuItemDidClick(this)
        break
      case 'hide':
        this.getModel().setHidden(true)
        break
      case 'randomize':
        this.getModel().randomize()
        break
    }
  }

  /**
   * Updates Brick status and message.
   * @param {string} status Status (e.g. success, error)
   * @param {string} message Status message
   * @return {BrickView} Fluent interface
   */
  updateStatus (status, message = null) {
    this._$status.className = `brick__status brick__status--${status}`
    this._$message.innerText = message || ''
    return this
  }
}
