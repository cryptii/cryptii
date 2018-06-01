
import SettingView from '../Setting'
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
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    const selectedIndex = this.getModel().getSelectedIndex()
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
    const $root = super.render()
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
    const elementLabels = this.getModel().getElementLabels()
    const elementDescriptions = this.getModel().getElementDescriptions()

    // prepare field
    const $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-enum__field')

    if (this.getStyle() === 'radio') {
      this._$$radio = []

      // prepare radio group
      const $radioGroup = View.createElement('div', {
        className: 'setting-enum__options',
        role: 'radiogroup',
        id: this.getId()
      })

      $field.appendChild($radioGroup)

      // render each option
      elementLabels.map((label, index) => {
        const optionId = `${this.getId()}-${index + 1}`

        const $radio = View.createElement('input', {
          type: 'radio',
          className: 'setting-enum__option-radio',
          id: optionId,
          onChange: this.valueDidChange.bind(this),
          name: this.getId()
        })

        const $option = View.createElement('div', {
          className: 'setting-enum__option'
        }, [
          $radio,
          View.createElement('label', {
            htmlFor: optionId,
            className: 'setting-enum__option-label'
          }, label)
        ])

        this._$$radio.push($radio)
        $radioGroup.appendChild($option)
      })
    } else {
      // create option for each element
      const $options = elementLabels.map((label, index) =>
        View.createElement('option', {
          value: index,
          title: elementDescriptions[index] || ''
        }, label))

      // create select element
      this._$select = View.createElement('select', {
        className: 'setting-enum__select',
        id: this.getId(),
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
    const index = this.getStyle() === 'radio'
      ? this._$$radio.findIndex($radio => $radio.checked)
      : parseInt(this._$select.value)

    // notify model
    const value = this.getModel().getElementAt(index)
    this.getModel().viewValueDidChange(this, value)
  }
}
