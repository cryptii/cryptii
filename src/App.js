
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
    this._pipe = null
  }

  /**
   * Bootstraps the application.
   * @return {Application} Fluent interface
   */
  run () {
    let $pipeData = document.querySelector('.app .app__pipe .pipe__data')
    let pipeData = JSON.parse($pipeData.innerHTML)
    this._pipe = Pipe.extract(pipeData)

    // trigger view creation and initial layout
    let view = this.getView()
    view.layout()
    setTimeout(view.layout.bind(view), 100)

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
