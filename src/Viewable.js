import View from './View.js'

/**
 * Abstract foundation for objects that own a view.
 * @abstract
 */
export default class Viewable {
  /**
   * Constructor
   */
  constructor () {
    this._view = null
    this._viewPrototype = View
  }

  /**
   * Returns wether a view has already been created.
   * @return {boolean}
   */
  hasView () {
    return this._view !== null
  }

  /**
   * Lazily returns a view.
   * @return {View}
   */
  getView () {
    if (this._view === null) {
      this._view = new (this._viewPrototype)()
      this._view.setModel(this)
      this.didCreateView(this._view)
    }
    return this._view
  }

  /**
   * Updates view if any.
   * @return {Viewable} Fluent interface
   */
  updateView () {
    this.hasView() && this.getView().setNeedsUpdate()
    return this
  }

  /**
   * Triggered when view has been created.
   * Override this method to add initial subviews.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // override method if needed
  }
}
