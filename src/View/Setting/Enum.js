
import SettingView from '../Setting'
import View from '../../View'

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
    // create option for each element
    let elementLabels = this.getModel().getElementLabels()
    let elementDescriptions = this.getModel().getElementDescriptions()
    let $options = elementLabels.map((label, index) =>
      View.createElement('option', {
        value: index,
        title: elementDescriptions[index] || ''
      }, label))

    // create select element
    this._$select = View.createElement('select', {
      className: 'setting-enum__select',
      onChange: this.selectValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    }, $options)

    // append to field
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
