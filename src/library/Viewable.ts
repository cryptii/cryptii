
import React from 'react'

/**
 * Abstract model providing functionality for maintaining a view.
 */
export default class Viewable {
  /**
   * Last rendered React element
   */
  private viewElement?: any

  /**
   * React component this model is represented by
   */
  protected viewComponent?: any

  /**
   * Parent viewable to be informed when this model's view needs an update
   */
  private parentView?: Viewable

  /**
   * Flag raised when the view of this model needs to be updated
   */
  private viewNeedsUpdate: boolean = false

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      model: this
    }
  }

  /**
   * Sets the parent viewable to be informed when this model's view needs an update
   * @param viewable - Viewable instanxce
   */
  setParentView (viewable: Viewable | undefined) {
    this.parentView = viewable
  }

  /**
   * Lazily creates an immutable React element representing this viewable.
   * If the {@link Viewable.viewNeedsUpdate} flag is not raised the previously
   * rendered element gets returned.
   * @returns React element
   */
  render (): any {
    // Compose view props
    const props = this.compose()

    // Create element
    if (this.viewElement === undefined) {
      this.viewElement = React.createElement(this.viewComponent, props)
    } else if (this.viewNeedsUpdate) {
      this.viewElement = React.cloneElement(this.viewElement, props)
    }

    // Clear 'needs update' flag from this viewable
    this.viewNeedsUpdate = false
    return this.viewElement
  }

  /**
   * Updates the view if it has already been initialized.
   */
  updateView (): void {
    // Ignore calls to this method if no view is in use
    if (this.viewElement === undefined) {
      return
    }

    // Raise 'needs update' flag
    this.viewNeedsUpdate = true

    // Inform the parent viewable about the need to rerender
    if (this.parentView !== undefined) {
      this.parentView.subviewNeedsUpdate(this)
    }
  }

  /**
   * Called when {@link Viewable.updateView} is triggered on a subview this view
   * is depending on.
   */
  subviewNeedsUpdate (viewable: Viewable): void {
    // As this view depends on the subview, it needs to be updated, too.
    this.updateView()
  }
}
