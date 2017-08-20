
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
    // retrieve pipe element
    let $pipeData = document.querySelector('.app .app__pipe .pipe__data')

    // TODO this may fail, handle parse errors
    let pipeData = JSON.parse($pipeData.innerHTML)

    // extract pipe from data
    this._pipe = Pipe.extract(pipeData)

    // trigger view creation and initial layout
    let view = this.getView()
    view.layout()

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
