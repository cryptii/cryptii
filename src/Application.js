
import ApplicationView from './View/Application'
import Pipe from './Pipe'
import Viewable from './Viewable'

/**
 * Application
 */
export default class Application extends Viewable {
  /**
   * Application constructor.
   */
  constructor () {
    super()

    this._viewPrototype = ApplicationView
    this._pipe = new Pipe()

    // trigger view creation
    this.getView()
  }

  /**
   * Bootstraps the application.
   * @return {Application} Fluent interface
   */
  run () {
    this._pipe.addBrick('text', 'affine-cipher', 'text')
    return this
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // add pipe subview
    view.addSubview(this._pipe.getView())
  }
}
