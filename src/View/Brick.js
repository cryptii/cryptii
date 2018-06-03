
import SettingView from './Setting'
import View from '../View'

/**
 * Brick view
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
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._$settings = this.renderSettings()
    const meta = this.getModel().getMeta()

    return View.createElement('div', {
      className: 'brick',
      role: 'region',
      ariaLabel: `${meta.title} ${meta.type}`
    }, [
      this.renderHeader(),
      this._$settings,
      this.renderContent(),
      this.renderStatus()
    ])
  }

  /**
   * Renders header.
   * @protected
   * @return {?HTMLElement}
   */
  renderHeader () {
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
            this.getModel().viewReplaceButtonDidClick(this)
          }
        }, this.getModel().getTitle())
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
    const items = [
      {
        label: 'Remove',
        name: 'remove'
      },
      {
        label: 'Hide',
        name: 'hide'
      }
    ]

    if (this.getModel().isRandomizable()) {
      items.push({
        label: 'Randomize',
        name: 'randomize'
      })
    }

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
   * Injects subview's root element into own DOM structure.
   * @protected
   * @param {View} view
   * @return {View} Fluent interface
   */
  appendSubviewElement (view) {
    if (view instanceof SettingView) {
      this.getElement()

      // get setting subviews
      const settingViews = this.getSubviews()
        .filter(view => view instanceof SettingView)

      // integrate new setting view
      settingViews.push(view)
      settingViews.sort((a, b) =>
        b.getModel().getPriority() - a.getModel().getPriority())

      // retrieve position of setting view we are integrating
      const index = settingViews.indexOf(view)
      const $referenceNode = index < settingViews.length - 1
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
