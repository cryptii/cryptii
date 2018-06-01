
import SettingView from '../Setting'
import View from '../../View'

/**
 * Number setting view
 */
export default class NumberSettingView extends SettingView {
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
    this._$input.value = this.getModel().getValue()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('setting-number')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'setting-number__input',
      id: this.getId(),
      type: 'number',
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    const $stepDown = View.createElement('a', {
      className: 'setting-number__btn-step-down',
      href: '#',
      onClick: this.stepDownButtonDidClick.bind(this)
    }, 'Step Down')

    const $value = View.createElement('div', {
      className: 'setting-number__value'
    }, this._$input)

    const $stepUp = View.createElement('a', {
      className: 'setting-number__btn-step-up',
      href: '#',
      onClick: this.stepUpButtonDidClick.bind(this)
    }, 'Step Up')

    const $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-number__field')
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
    // notify model
    this.getModel().viewValueDidChange(this, this._$input.value)
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
