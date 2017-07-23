
import SettingView from '../Setting'

/**
 * Number Setting View.
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
    let $root = super.render()
    $root.classList.add('setting-number')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = document.createElement('input')
    this._$input.classList.add('setting-number__input')
    this._$input.setAttribute('type', 'number')
    this._$input.addEventListener('input',
      this.inputValueDidChange.bind(this), false)

    let $stepDown = document.createElement('a')
    $stepDown.classList.add('setting-number__btn-step-down')
    $stepDown.setAttribute('href', '#')
    $stepDown.innerText = 'Step Down'
    $stepDown.addEventListener('click', this.stepDownButtonDidClick.bind(this))

    let $value = document.createElement('div')
    $value.classList.add('setting-number__value')
    $value.appendChild(this._$input)

    let $stepUp = document.createElement('a')
    $stepUp.classList.add('setting-number__btn-step-up')
    $stepUp.setAttribute('href', '#')
    $stepUp.innerText = 'Step Up'
    $stepUp.addEventListener('click', this.stepUpButtonDidClick.bind(this))

    let $field = super.renderField()
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
