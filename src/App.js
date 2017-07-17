
import AppView from './View/App'
import Pipe from './Pipe'
import Viewable from './Viewable'

/**
 * Application
 */
export default class App extends Viewable {
  /**
   * Application constructor.
   */
  constructor () {
    super()

    this._viewPrototype = AppView
  }

  /**
   * Bootstraps the application.
   * @return {Application} Fluent interface
   */
  run () {
    this._pipe = new Pipe()
    this._pipe.setTitle('Affine Cipher – Encode and Decode')
    this._pipe.addBrick('text', 'affine-cipher', 'text')
    this._pipe.setContent('The quick brown fox jumps over 13 lazy dogs.')

    // trigger view creation
    this.getView()

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
