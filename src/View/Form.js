import FieldView from './Field.js'
import View from '../View.js'

/**
 * Form view
 */
export default class FormView extends View {
  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    return View.createElement('div', {
      className: 'form'
    })
  }

  /**
   * Injects subview's root element into own DOM structure.
   * @protected
   * @param {View} view
   * @return {View} Fluent interface
   */
  appendSubviewElement (view) {
    if (view instanceof FieldView) {
      this.getElement()

      // Get field subviews
      const fieldViews = this.getSubviews()
        .filter(view => view instanceof FieldView)

      // Integrate new setting view
      fieldViews.push(view)

      // Maintain the order of fields set in the form model
      const fields = this.getModel().getFields()
      fieldViews.sort((a, b) =>
        fields.indexOf(a.getModel()) - fields.indexOf(b.getModel()))

      // Retrieve position of setting view we are integrating
      const index = fieldViews.indexOf(view)
      const $referenceNode = index < fieldViews.length - 1
        ? fieldViews[index + 1].getElement()
        : null

      this.getElement().insertBefore(view.getElement(), $referenceNode)

      // Determine for each setting view wether it appears first in a row
      let columns = 0
      fieldViews.forEach(settingView => {
        const width = settingView.getModel().getWidth()
        columns += width
        if (columns === width || columns > 12) {
          columns = width
          settingView.setFirst(true)
        } else {
          settingView.setFirst(false)
        }
      })
      return this
    }
    return super.appendSubviewElement(view)
  }
}
