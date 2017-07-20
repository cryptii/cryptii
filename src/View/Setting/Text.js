
import SettingView from '../Setting'

/**
 * Text Setting View.
 */
export default class TextSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('setting-text')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = document.createElement('input')
    this._$input.classList.add('setting-text__input')
    this._$input.setAttribute('spellcheck', 'false')
    this._$input.setAttribute('type', 'text')
    this._$input.addEventListener('input',
      this.inputValueDidChange.bind(this), false)
    this._$input.value = this.getModel().getValue().getString()

    let $field = super.renderField()
    $field.appendChild(this._$input)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // notify model
    this.getModel().viewValueDidChange(this, this._$input.value)
  }
}
