
import View from '../View'

/**
 * Modal view
 */
export default class ModalView extends View {
  /**
   * Modal constructor
   */
  constructor (title) {
    super()
    this._title = title
    this._visible = false
    this._value = null
    this._finishCallback = null
    this._cancelCallback = null

    // handlers
    this._keyUpHandler = this.keyDidPress.bind(this)

    // elements
    this._$outer = null
    this._$dialog = null
  }

  /**
   * Shows or hides modal view.
   * @param {boolean} visible Wether to make the modal view visible
   * @param {boolean} [cancelled=false] Wether modal view has been cancelled
   * @return {ModalView} Fluent interface
   */
  setVisible (visible = true, cancelled = false) {
    if (this._visible !== visible) {
      this._visible = visible

      // make sure modal is rendered
      const $element = this.getElement()

      if (visible) {
        // add modal view to dom
        document.body.appendChild($element)
      }

      // measure dialog height
      const dialogHeight = this._$dialog.getBoundingClientRect().height

      // set dialog height to transition from
      if (visible) {
        this._$dialog.style.height = '0px'
      } else {
        this._$dialog.style.height = `${dialogHeight}px`

        // setting the outer height explicitly prevents it from scrolling to the
        // top when the dialog height is set to zero
        this._$outer.style.height = `${dialogHeight}px`
      }

      // trigger browser layout
      $element.getBoundingClientRect()

      // listen to the transition end event; add a short delay to let the
      // transition finish without cutting off frames at the end
      $element.addEventListener('transitionend', () => {
        setTimeout(this.visibilityDidChange.bind(this, visible, cancelled), 100)
      }, { once: true })

      // trigger modal transition
      document.body.classList.toggle('modal-visible', visible)
      $element.classList.toggle('modal--visible', visible)

      if (visible) {
        // set dialog height to transition to
        this._$dialog.style.height = `${dialogHeight}px`

        // listen to key press events to close the modal when hitting escape
        this._keyUpHandler &&
          document.addEventListener('keyup', this._keyUpHandler)
      } else {
        // set dialog height to transition to
        this._$dialog.style.height = '0px'

        // remove key press listener
        this._keyUpHandler &&
          document.removeEventListener('keyup', this._keyUpHandler)
      }
    }
    return this
  }

  /**
   * Triggered after visibility change is complete.
   * @param {boolean} visible
   * @param {boolean} cancelled
   */
  visibilityDidChange (visible, cancelled) {
    if (visible) {
      this._$dialog.removeAttribute('style')
    } else {
      setTimeout(() => {
        // clean up
        this._$dialog.removeAttribute('style')
        this._$outer.removeAttribute('style')

        // remove element from dom
        const $element = this.getElement()
        if ($element.parentNode !== null) {
          $element.parentNode.removeChild($element)
        }
      }, 100)

      // trigger finish or cancel callback
      if (cancelled === false && this._finishCallback !== null) {
        this._finishCallback(this._value)
      } else if (cancelled === true && this._cancelCallback !== null) {
        this._cancelCallback()
      }

      // clear handlers
      this._finishCallback = null
      this._cancelCallback = null
    }
  }

  /**
   * Returns modal value.
   * @return {mixed}
   */
  getValue () {
    return this._value
  }

  /**
   * Sets the modal value.
   * @param {mixed} value
   */
  setValue (value) {
    if (this._value !== value) {
      this._value = value
      this.valueDidChange(value)
    }
    return this
  }

  /**
   * Triggered when the modal value did change.
   * @param {mixed} value
   */
  valueDidChange (value) {
    // override
  }

  /**
   * Opens a modal view and returns a promise being resolved when the user
   * completes or cancels it.
   * @param {mixed} [value] Initial modal view value
   * @return {Promise} Result promise
   */
  prompt (value = undefined) {
    if (value !== undefined) {
      this.setValue(value)
    }
    return new Promise((resolve, reject) => {
      this._finishCallback = resolve
      this._cancelCallback = reject
      this.open()
    })
  }

  /**
   * Opens modal view.
   * @return {ModalView} Fluent interface
   */
  open () {
    return this.setVisible(true)
  }

  /**
   * Cancels modal view.
   * @return {ModalView} Fluent interface
   */
  cancel () {
    return this.setVisible(false, true)
  }

  /**
   * Finishes modal view with current value.
   * @param {mixed} [value] Finish modal with given value (optional).
   * @return {ModalView} Fluent interface
   */
  finish (value = undefined) {
    if (value !== undefined) {
      this.setValue(value)
    }
    return this.setVisible(false, false)
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._$dialog = this.renderDialog()
    this._$outer = View.createElement('div', {
      className: 'modal__outer'
    }, [
      this._$dialog
    ])

    return View.createElement('div', {
      className: 'modal',
      role: 'dialog',
      tabindex: -1
    }, [
      View.createElement('div', {
        className: 'modal__backdrop'
      }),
      View.createElement('div', {
        className: 'modal__scrollable',
        role: 'document',
        onClick: evt => {
          if (evt.target === evt.currentTarget) {
            evt.preventDefault()
            this.cancel()
          }
        }
      }, [
        this._$outer
      ])
    ])
  }

  /**
   * Renders modal dialog.
   * @protected
   * @return {HTMLElement}
   */
  renderDialog () {
    return View.createElement('div', {
      className: 'modal__dialog'
    }, [
      this.renderHeader(),
      this.renderContent()
    ])
  }

  /**
   * Renders modal header.
   * @protected
   * @return {HTMLElement}
   */
  renderHeader () {
    return View.createElement('header', {
      className: 'modal__header'
    }, [
      View.createElement('span', {
        className: 'modal__title'
      }, this._title),
      View.createElement('a', {
        className: 'modal__btn-close',
        href: '#',
        onClick: evt => {
          evt.preventDefault()
          this.cancel()
        }
      }, 'Cancel')
    ])
  }

  /**
   * Renders modal content.
   * @protected
   * @return {HTMLElement}
   */
  renderContent () {
    // override
  }

  /**
   * Triggered when a key has been pressed.
   * @param {Event} evt
   */
  keyDidPress (evt) {
    // has the escape key been pressed
    if (evt.keyCode === 27) {
      evt.preventDefault()
      this.cancel()
    }
  }
}
