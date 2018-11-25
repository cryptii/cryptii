
import AppView from './View/App'
import BrickFactory from './Factory/Brick'
import Browser from './Browser'
import Pipe from './Pipe'
import Viewable from './Viewable'

// singleton instance
let instance = null

/**
 * Application
 */
export default class App extends Viewable {
  /**
   * Application constructor
   */
  constructor () {
    super()
    this._viewPrototype = AppView
    this._pipe = null
  }

  /**
   * Bootstraps the application.
   * @return {App} Fluent interface
   */
  run () {
    // apply browser class name
    Browser.applyClassName()

    // read pipe data
    const $pipeData = document.querySelector('.app .app__pipe .pipe__data')
    const pipeData = JSON.parse($pipeData.innerHTML)
    this._pipe = Pipe.extract(pipeData, BrickFactory.getInstance())

    // trigger view creation and initial layout
    const view = this.getView()
    view.layout()
    setTimeout(view.layout.bind(view), 100)

    return this
  }

  /**
   * Returns pipe instance.
   * @return {Pipe}
   */
  getPipe () {
    return this._pipe
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

  /**
   * Returns app singleton instance.
   * @return {App}
   */
  static getInstance () {
    if (instance === null) {
      instance = new App()
    }
    return instance
  }
}
