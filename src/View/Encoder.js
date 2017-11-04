
import Analytics from '../Analytics'
import BrickView from './Brick'
import View from '../View'

/**
 * Encoder Brick View.
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
    let $root = super.render()
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
      onClick: this.actionDidClick.bind(this, 'encode')
    }, 'Encode')

    this._$decodeAction = View.createElement('a', {
      className: 'brick__action',
      href: '#',
      onClick: this.actionDidClick.bind(this, 'decode')
    }, 'Decode')

    let $actions = View.createElement('ul', {
      className: 'brick__actions'
    }, [
      View.createElement('li', {
        className: 'brick__action-item'
      }, this._$encodeAction),
      View.createElement('li', {
        className: 'brick__action-item'
      }, this._$decodeAction)
    ])

    let $header = super.renderHeader()
    $header.insertBefore($actions, $header.firstChild)
    return $header
  }

  /**
   * Renders content.
   * @return {?HTMLElement}
   */
  renderContent () {
    // generic encoder bricks have no content
    return null
  }

  actionDidClick (action, evt) {
    evt.preventDefault()
    this.toggleSelection(false)

    // check if encoder should be reversed
    let reverse = action === 'decode'
    if (this.getModel().isReverse() !== reverse) {
      this.getModel().setReverse(reverse)

      Analytics.trackEvent('encoder_reverse', {
        'event_category': 'encoder',
        'event_action': 'reverse',
        'event_label': this.getModel().getMeta().name
      })
    }
  }

  /**
   * Updates view on model change.
   * @return {View} Fluent interface
   */
  update () {
    // update action
    let reverse = this.getModel().isReverse()
    this._$encodeAction.classList.toggle('brick__action--active', !reverse)
    this._$decodeAction.classList.toggle('brick__action--active', reverse)

    // update status
    let error = this.getModel().getLastError()
    let translation = this.getModel().getLastTranslationMeta()

    if (translation !== null) {
      let status = translation.isEncode !== reverse ? 'backward' : 'forward'
      let message = `${translation.isEncode ? 'Encoded' : 'Decoded'} `

      if (translation.charCount !== null) {
        message +=
          `${translation.charCount} ` +
          `${translation.charCount === 1 ? 'char' : 'chars'} `
      } else {
        message +=
          `${translation.byteCount} ` +
          `${translation.byteCount === 1 ? 'byte' : 'bytes'} `
      }

      if (translation.duration < 10) {
        message += `in ${parseInt(translation.duration * 100) / 100}ms`
      } else if (translation.duration < 1000) {
        message += `in ${parseInt(translation.duration)}ms`
      } else {
        message += `in ${parseInt(translation.duration / 1000)}s`
      }
      return this.updateStatus(status, message)
    }

    if (error !== null) {
      return this.updateStatus('error', error.message)
    }

    return this
  }
}
