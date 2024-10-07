import FieldView from '../Field.js'
import View from '../../View.js'

/**
 * Text field view
 */
export default class TextFieldView extends FieldView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {FieldView} Fluent interface
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
    $root.classList.add('field-text')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'field-text__input',
      id: this.getId(),
      type: 'text',
      spellcheck: false,
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    const $field = super.renderField()
    $field.classList.remove('field__field')
    $field.classList.add('field-text__field')
    $field.appendChild(this._$input)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // Notify model
    this.getModel().viewValueDidChange(this, this._$input.value)
  }
}
