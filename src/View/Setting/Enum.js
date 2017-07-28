
import SettingView from '../Setting'

/**
 * Enum Setting View.
 */
export default class EnumSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$select = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    this._$select.value = this.getModel().getSelectedIndex()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.classList.add('setting-enum')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$select = document.createElement('select')
    this._$select.classList.add('setting-enum__select')

    // create option for each element
    let elementLabels = this.getModel().getElementLabels()
    elementLabels.forEach((label, index) => {
      let $option = document.createElement('option')
      $option.innerText = label
      $option.value = index
      this._$select.appendChild($option)
    })

    // bind change event
    this._$select.addEventListener('change',
      this.selectValueDidChange.bind(this), false)

    let $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-enum__field')
    $field.appendChild(this._$select)
    return $field
  }

  /**
   * Triggered when select value has been changed.
   * @param {Event} evt
   */
  selectValueDidChange (evt) {
    // notify model
    let index = parseInt(this._$select.value)
    let value = this.getModel().getElementAt(index)
    this.getModel().viewValueDidChange(this, value)
  }
}
