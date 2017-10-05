
import AppView from './View/App'
import Pipe from './Pipe'
import Viewable from './Viewable'
import ErrorReporter from './ErrorReporter'

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

    // default config object
    this._config = {
      name: 'Cryptii',
      version: '4.0.0-alpha',

      googleApiKey: null,
      googleProjectId: null,

      uncaughtErrorReporting: false,
      errorReporting: false
    }
  }

  /**
   * Bootstraps the application.
   * @return {Application} Fluent interface
   */
  run () {
    let config = this._config

    try {
      // try to retrieve app config, parse errors may occur
      let $appData = document.querySelector('.app .app__config')
      // overwrite default config properties
      config = Object.assign(config, JSON.parse($appData.innerHTML))
    } catch (err) {
    }

    // configure error reporter
    ErrorReporter.getInstance().configure({
      googleApiKey: config.googleApiKey,
      googleProjectId: config.googleProjectId,
      serviceName: config.name,
      serviceVersion: config.version,
      uncaughtErrorReporting: config.uncaughtErrorReporting,
      errorReporting: config.errorReporting
    })

    try {
      // try to retrieve pipe data, parse errors may occur
      let $pipeData = document.querySelector('.app .app__pipe .pipe__data')
      let pipeData = JSON.parse($pipeData.innerHTML)
      this._pipe = Pipe.extract(pipeData)
    } catch (err) {
      // create empty pipe
      this._pipe = new Pipe()
    }

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
