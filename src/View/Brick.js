import FormView from './Form.js'
import View from '../View.js'

const arrowLeftSvg = '<svg viewBox="0 0 16 16"><polygon points="16 7 3.83 7 7.41 3.41 6 2 0 8 6 14 7.41 12.59 3.83 9 16 9"/></svg>'
const caretIconSvg = '<svg viewBox="0 0 16 16"><polygon points="3 6 8 11 13 6"/></svg>'
const errorIconSvg = '<svg viewBox="0 0 16 16"><polygon points="15 2.41 13.59 1 8 6.59 2.41 1 1 2.41 6.59 8 1 13.59 2.41 15 8 9.41 13.59 15 15 13.59 9.41 8"/></svg>'
const menuIconSvg = '<svg viewBox="0 0 16 16" fill="#000" title="Menu"><circle cx="8" cy="2" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="14" r="1.5"/></svg>'

const statusIcons = {
  forward: arrowLeftSvg,
  backward: arrowLeftSvg,
  error: errorIconSvg
}

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
    this._$header = null
    this._$status = null
    this._$statusIcon = null
    this._$statusMessage = null

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
    this._$header = this.renderHeader()
    const meta = this.getModel().getMeta()

    return View.createElement('div', {
      className: 'brick',
      role: 'region',
      ariaLabel: `${meta.title} ${meta.type}`
    }, [
      this._$header,
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

    const $menuButton = View.createElement('button', {
      className: 'brick__btn-menu',
      onClick: evt => {
        evt.preventDefault()
        this.toggleMenu()
      }
    })
    $menuButton.innerHTML = menuIconSvg

    const $caretIcon = View.createElement('div', {
      className: 'brick__title-caret'
    })
    $caretIcon.innerHTML = caretIconSvg

    return View.createElement('header', {
      className: 'brick__header'
    }, [
      View.createElement('button', {
        className: 'brick__title',
        onClick: evt => {
          evt.preventDefault()
          this.getModel().viewReplaceButtonDidClick(this)
        }
      }, [
        View.createElement('h3', {
          className: 'brick__title-inner'
        }, this.getModel().getTitle()),
        $caretIcon
      ]),
      $menuButton
    ])
  }

  /**
   * Renders menu.
   * @protected
   * @return {HTMLElement}
   */
  renderMenu () {
    const items = []

    if (this.getModel().hasPipe()) {
      items.push({
        label: 'Remove',
        name: 'remove'
      })
      items.push({
        label: 'Hide',
        name: 'hide'
      })
      items.push({
        label: 'Duplicate',
        name: 'duplicate'
      })
    }

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
          View.createElement('button', {
            className: 'menu__button',
            onClick: evt => {
              evt.preventDefault()
              this.getModel().viewMenuItemDidClick(this, item.name)
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
    this._$statusIcon = View.createElement('div', {
      className: 'brick__status-icon'
    })

    this._$statusMessage = View.createElement('div', {
      className: 'brick__status-message'
    })

    this._$status = View.createElement('footer', {
      className: 'brick__status brick__status--hidden'
    }, [
      this._$statusIcon,
      this._$statusMessage
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
    if (view instanceof FormView) {
      this.getElement()
      this._$settings.appendChild(view.getElement())
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

    if (this._menuVisible) {
      // append menu and trigger next cycle
      this._$header.appendChild(this._$menu)
      this._$menu.getBoundingClientRect()

      // show menu animated
      this._$menu.classList.add('menu--visible')

      // listen to the next window click to hide the menu again
      window.requestAnimationFrame(() => {
        window.addEventListener('click', this._menuHideHandler)
      })
    } else {
      // remove menu
      this._$header.removeChild(this._$menu)

      // remove listener
      window.removeEventListener('click', this._menuHideHandler)
    }
  }

  /**
   * Updates Brick status and message.
   * @param {string|null} status Status (e.g. success, error)
   * @param {string|null} message Status message
   * @return {BrickView} Fluent interface
   */
  updateStatus (status, message = null) {
    if (status === null) {
      // Hide status
      this._$status.classList.add('brick__status--hidden')
      this._$statusIcon.innerHTML = null
      this._$statusMessage.innerText = null
    } else {
      // Apply status
      this._$status.className = `brick__status brick__status--${status}`

      // Apply icon and message
      this._$statusIcon.innerHTML = statusIcons[status] || ''
      this._$statusMessage.innerText = message || ''

      // Animate translation flash
      if (status === 'forward' || status === 'backward') {
        this._$status.classList.add('brick__status--flash')

        // Force paint to trigger flash animation
        this._$status.getBoundingClientRect()
        this._$status.classList.remove('brick__status--flash')
      }
    }

    return this
  }
}
