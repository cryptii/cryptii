
import SettingView from '../Setting'
import StringUtil from '../../StringUtil'
import View from '../../View'

/**
 * Enum setting view
 */
export default class EnumSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$select = null
    this._$$radio = []
    this._inputId = StringUtil.uniqueId()
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    let selectedIndex = this.getModel().getSelectedIndex()
    if (this.getStyle() === 'radio') {
      this._$$radio.forEach(($radio, index) => {
        $radio.checked = index === selectedIndex
      })
    } else {
      this._$select.value = selectedIndex
    }
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let $root = super.render()
    $root.className += ` setting-enum setting-enum--${this.getStyle()}`
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    // collect labels
    let elementLabels = this.getModel().getElementLabels()
    let elementDescriptions = this.getModel().getElementDescriptions()

    // prepare field
    let $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-enum__field')

    if (this.getStyle() === 'radio') {
      this._$$radio = []

      // render each option
      elementLabels.map((label, index) => {
        let $radio = View.createElement('input', {
          type: 'radio',
          className: 'setting-enum__option-radio',
          onChange: this.valueDidChange.bind(this),
          id: `${this._inputId}-${index}`,
          name: this._inputId
        })

        let $option = View.createElement('div', {
          className: 'setting-enum__option'
        }, [
          $radio,
          View.createElement('label', {
            htmlFor: `${this._inputId}-${index}`,
            className: 'setting-enum__option-label'
          }, label)
        ])

        this._$$radio.push($radio)
        $field.appendChild($option)
      })
    } else {
      // create option for each element
      let $options = elementLabels.map((label, index) =>
        View.createElement('option', {
          value: index,
          title: elementDescriptions[index] || ''
        }, label))

      // create select element
      this._$select = View.createElement('select', {
        className: 'setting-enum__select',
        onChange: this.valueDidChange.bind(this),
        onFocus: evt => this.focus(),
        onBlur: evt => this.blur()
      }, $options)

      // append to field
      $field.appendChild(this._$select)
    }

    return $field
  }

  /**
   * Triggered when select or radio input value has been changed.
   * @param {Event} evt
   */
  valueDidChange (evt) {
    // retrieve selected index
    let index = this.getStyle() === 'radio'
      ? this._$$radio.findIndex($radio => $radio.checked)
      : parseInt(this._$select.value)

    // notify model
    let value = this.getModel().getElementAt(index)
    this.getModel().viewValueDidChange(this, value)
  }
}
