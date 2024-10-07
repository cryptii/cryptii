import BrickView from './Brick.js'
import View from '../View.js'

/**
 * Encoder brick view
 */
export default class EncoderView extends BrickView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$encodeAction = null
    this._$decodeAction = null
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('encoder')
    return $root
  }

  /**
   * Renders header.
   * @protected
   * @return {BrickView} Fluent interface
   */
  renderHeader () {
    this._$encodeAction = View.createElement('a', {
      className: 'brick__action brick__action--active',
      href: '#',
      onClick: this.actionDidClick.bind(this, 'encode'),
      draggable: false
    }, 'Encode')

    this._$decodeAction = View.createElement('a', {
      className: 'brick__action',
      href: '#',
      onClick: this.actionDidClick.bind(this, 'decode'),
      draggable: false
    }, 'Decode')

    const $actions = View.createElement('ul', {
      className: 'brick__actions'
    }, [
      View.createElement('li', {
        className: 'brick__action-item'
      }, this._$encodeAction),
      View.createElement('li', {
        className: 'brick__action-item'
      }, this._$decodeAction)
    ])

    const $header = super.renderHeader()
    $header.insertBefore($actions, $header.firstChild)
    return $header
  }

  /**
   * Renders content.
   * @return {?HTMLElement}
   */
  renderContent () {
    // Generic encoder bricks have no content
    return null
  }

  actionDidClick (action, evt) {
    evt.preventDefault()

    // Check if encoder should be reversed
    const reverse = action === 'decode'
    if (this.getModel().isReverse() !== reverse) {
      this.getModel().viewDidReverse(this)
    }
  }

  /**
   * Updates view on model change.
   * @return {View} Fluent interface
   */
  update () {
    // Update action
    const reverse = this.getModel().isReverse()

    if (reverse) {
      this._$encodeAction.classList.remove('brick__action--active')
      this._$decodeAction &&
        this._$decodeAction.classList.add('brick__action--active')
    } else {
      this._$encodeAction.classList.add('brick__action--active')
      this._$decodeAction &&
        this._$decodeAction.classList.remove('brick__action--active')
    }

    // Update status
    const error = this.getModel().getLastError()
    const translation = this.getModel().getLastTranslationMeta()

    if (translation !== null) {
      const status = translation.isEncode ? 'forward' : 'backward'
      let message =
        `${translation.isEncode !== reverse ? 'Encoded' : 'Decoded'} `

      if (translation.charCount !== null) {
        message +=
          `${translation.charCount} ` +
          `${translation.charCount === 1 ? 'char' : 'chars'}`
      } else {
        message +=
          `${translation.byteCount} ` +
          `${translation.byteCount === 1 ? 'byte' : 'bytes'}`
      }

      return this.updateStatus(status, message)
    }

    if (error !== null) {
      return this.updateStatus('error', error.message)
    }

    return this
  }
}
