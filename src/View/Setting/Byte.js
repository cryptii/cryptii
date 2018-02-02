
import ByteEncoder from '../../ByteEncoder'
import SettingView from '../Setting'
import StringUtil from '../../StringUtil'
import View from '../../View'

/**
 * Byte Setting View.
 */
export default class ByteSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null
    this._inputId = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    let bytes = this.getModel().getValue()
    let string = ByteEncoder.hexStringFromBytes(bytes)
    string = StringUtil.chunk(string, 2).join(' ')
    this._$input.value = string
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._inputId = StringUtil.uniqueId()

    let $root = super.render()
    $root.classList.add('setting-byte')
    return $root
  }

  /**
   * Renders label.
   * @protected
   * @return {?HTMLElement}
   */
  renderLabel () {
    let $label = super.renderLabel()
    $label.htmlFor = this._inputId
    return $label
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'setting-byte__input',
      id: this._inputId,
      type: 'text',
      spellcheck: false,
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    let $field = super.renderField()
    $field.appendChild(this._$input)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    let string = StringUtil.removeWhitespaces(this._$input.value)

    // verify hexadecimal format
    if (string.match(/^[0-9a-f]+$/gi) === null) {
      return this.setMessage(`The value contains non-hexadecimal characters`)
    }

    // clear message
    this.clearMessage()

    // interpret bytes
    let bytes = ByteEncoder.bytesFromHexString(string)
    this.getModel().viewValueDidChange(this, bytes)
  }
}
