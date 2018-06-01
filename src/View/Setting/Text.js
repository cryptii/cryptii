
import SettingView from '../Setting'
import View from '../../View'

/**
 * Text setting view
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
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    this._$input.value = this.getModel().getValue().getString()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('setting-text')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'setting-text__input',
      id: this.getId(),
      type: 'text',
      spellcheck: false,
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    const $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-text__field')
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
