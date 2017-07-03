
import ApplicationView from './View/Application'
import Brick from './Brick'
import Pipe from './Pipe'

/**
 * Application
 */
export default class Application {
  /**
   * Application constructor.
   */
  constructor () {
    this._pipe = new Pipe()

    this._view = new ApplicationView()
    this._view.addSubview(this._pipe.getView())
  }

  /**
   * Bootstraps the application.
   * @return {Application} Fluent interface
   */
  run () {
    this._pipe.addBrick(new Brick())
    this._pipe.addBrick(new Brick())
    return this
  }

  /**
   * Returns view.
   * @return {View}
   */
  getView () {
    return this._view
  }

  /**
   * Creates view.
   * @protected
   * @return {View} Newly created view.
   */
  createView () {
    let view = new ApplicationView()
    return view
  }
}
