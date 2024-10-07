import FieldView from '../Field.js'
import View from '../../View.js'

/**
 * Boolean field view
 */
export default class BooleanFieldView extends FieldView {
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
    this._$input.checked = this.getModel().getValue()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('field-boolean')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'field-boolean__input',
      type: 'checkbox',
      id: this.getId(),
      onChange: this.inputValueDidChange.bind(this),
      checked: this.getModel().getValue(),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    const $toggle = View.createElement('label', {
      className: 'field-boolean__toggle',
      htmlFor: this.getId()
    }, [
      View.createElement('span', {
        className: 'field-boolean__choice'
      }, this.getModel().getTrueLabel()),
      View.createElement('span', {
        className: 'field-boolean__choice'
      }, this.getModel().getFalseLabel())
    ])

    const $field = super.renderField()
    $field.appendChild(this._$input)
    $field.appendChild($toggle)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // Notify model
    this.getModel().viewValueDidChange(this, this._$input.checked)
  }
}
