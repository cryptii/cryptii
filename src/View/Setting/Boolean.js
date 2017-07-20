
import SettingView from '../Setting'
import StringUtil from '../../StringUtil'

/**
 * Boolean Setting View.
 */
export default class BooleanSettingView extends SettingView {
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
    $root.classList.add('setting-boolean')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    let id = StringUtil.uniqueId()

    this._$input = document.createElement('input')
    this._$input.classList.add('setting-boolean__input')
    this._$input.setAttribute('type', 'checkbox')
    this._$input.setAttribute('id', id)
    this._$input.addEventListener('change',
      this.inputValueDidChange.bind(this), false)
    this._$input.checked = this.getModel().getValue()

    let $trueChoice = document.createElement('span')
    $trueChoice.classList.add('setting-boolean__choice')
    $trueChoice.innerText = this.getModel().getTrueLabel()

    let $falseChoice = document.createElement('span')
    $falseChoice.classList.add('setting-boolean__choice')
    $falseChoice.innerText = this.getModel().getFalseLabel()

    let $toggle = document.createElement('label')
    $toggle.classList.add('setting-boolean__toggle')
    $toggle.setAttribute('for', id)
    $toggle.appendChild($trueChoice)
    $toggle.appendChild($falseChoice)

    let $field = super.renderField()
    $field.appendChild(this._$input)
    $field.appendChild($toggle)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    // notify model
    this.getModel().viewValueDidChange(this, this._$input.checked)
  }
}
