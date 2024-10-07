import FieldView from '../Field.js'
import View from '../../View.js'

/**
 * Enum field view
 */
export default class EnumFieldView extends FieldView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._style = 'default'
    this._$select = null
    this._$$radio = []
  }

  /**
   * Returns field appearance.
   * @return {string}
   */
  getStyle () {
    return this._style
  }

  /**
   * Sets the field appearance.
   * @param {string} style
   * @return {Field} Fluent interface
   */
  setStyle (style) {
    if (this._style !== style) {
      this._style = style
      this.refresh()
    }
    return this
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {FieldView} Fluent interface
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
    $root.className += ` field-enum field-enum--${this.getStyle()}`
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    // Collect labels
    const elementLabels = this.getModel().getElementLabels()
    const elementDescriptions = this.getModel().getElementDescriptions()

    // Prepare field
    const $field = super.renderField()
    $field.classList.remove('field__field')
    $field.classList.add('field-enum__field')

    if (this.getStyle() === 'radio') {
      this._$$radio = []

      // Prepare radio group
      const $radioGroup = View.createElement('div', {
        className: 'field-enum__options',
        role: 'radiogroup',
        id: this.getId()
      })

      $field.appendChild($radioGroup)

      // Render each option
      elementLabels.forEach((label, index) => {
        const optionId = `${this.getId()}-${index + 1}`

        const $radio = View.createElement('input', {
          type: 'radio',
          className: 'field-enum__option-radio',
          id: optionId,
          onChange: this.valueDidChange.bind(this),
          name: this.getId()
        })

        const $option = View.createElement('div', {
          className: 'field-enum__option'
        }, [
          $radio,
          View.createElement('label', {
            htmlFor: optionId,
            className: 'field-enum__option-label'
          }, label)
        ])

        this._$$radio.push($radio)
        $radioGroup.appendChild($option)
      })
    } else {
      // Create option for each element
      const $options = elementLabels.map((label, index) =>
        View.createElement('option', {
          value: index,
          title: elementDescriptions[index] || ''
        }, label))

      // Create select element
      this._$select = View.createElement('select', {
        className: 'field-enum__select',
        id: this.getId(),
        onChange: this.valueDidChange.bind(this),
        onFocus: evt => this.focus(),
        onBlur: evt => this.blur()
      }, $options)

      // Append to field
      $field.appendChild(this._$select)
    }

    return $field
  }

  /**
   * Triggered when select or radio input value has been changed.
   * @param {Event} evt
   */
  valueDidChange (evt) {
    // Retrieve selected index
    const index = this.getStyle() === 'radio'
      ? this._$$radio.findIndex($radio => $radio.checked)
      : parseInt(this._$select.value)

    // Notify model
    const value = this.getModel().getElementAt(index)
    this.getModel().viewValueDidChange(this, value)
  }
}
