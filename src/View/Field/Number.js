import FieldView from '../Field.js'
import View from '../../View.js'

/**
 * Number field view
 */
export default class NumberFieldView extends FieldView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null

    // Field display elements enriching the value with a description, if any
    this._displayEnabled = false
    this._$display = null
    this._$displayValue = null
    this._$displayDescription = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {FieldView} Fluent interface
   */
  updateValue () {
    const value = this.getModel().getValue()
    this._$input.value = value.toString()
    this._updateValueDisplay()
    return this
  }

  /**
   * Retrieves the value description from the model and updates it in view.
   * @return {FieldView} Fluent interface
   */
  _updateValueDisplay () {
    const value = this.getModel().getValue()
    const valueDescription = this.getModel().getValueDescription()
    const displayEnabled = valueDescription !== null

    // Check if display enable state has changed
    if (this._displayEnabled !== displayEnabled) {
      this._displayEnabled = displayEnabled
      if (displayEnabled) {
        this._$display.classList.add('field-number__display--enabled')
      } else {
        this._$display.classList.remove('field-number__display--enabled')

        // Clean up display values
        this._$displayValue.innerText = ''
        this._$displayDescription.innerText = ''
      }
    }

    if (displayEnabled) {
      // Update display value and description
      this._$displayValue.innerText = value.toString()
      this._$displayDescription.innerText = valueDescription
    }

    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('field-number')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'field-number__input',
      id: this.getId(),
      type: 'number',
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    this._$displayValue = View.createElement('span', {
      className: 'field-number__display-value'
    })

    this._$displayDescription = View.createElement('span', {
      className: 'field-number__display-description'
    })

    this._$display = View.createElement('div', {
      className: 'field-number__display'
    }, [this._$displayValue, this._$displayDescription])

    const $stepDown = View.createElement('button', {
      className: 'field-number__btn-step-down',
      onClick: this.stepDownButtonDidClick.bind(this)
    }, 'Step Down')

    const $value = View.createElement('div', {
      className: 'field-number__value'
    }, [this._$input, this._$display])

    const $stepUp = View.createElement('button', {
      className: 'field-number__btn-step-up',
      onClick: this.stepUpButtonDidClick.bind(this)
    }, 'Step Up')

    const $field = super.renderField()
    $field.classList.remove('field__field')
    $field.classList.add('field-number__field')
    $field.appendChild($stepDown)
    $field.appendChild($value)
    $field.appendChild($stepUp)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // Notify model
    this.getModel().viewValueDidChange(this, this._$input.value)
    // Keep value display in sync with the input value
    this._updateValueDisplay()
  }

  /**
   * Triggered when step down button has been clicked.
   * @param {Event} evt
   */
  stepDownButtonDidClick (evt) {
    this.getModel().stepDown()
    evt.preventDefault()
    return false
  }

  /**
   * Triggered when step up button has been clicked.
   * @param {Event} evt
   */
  stepUpButtonDidClick (evt) {
    this.getModel().stepUp()
    evt.preventDefault()
    return false
  }
}
