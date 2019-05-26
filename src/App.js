
import AppView from './View/App'
import BrickFactory from './Factory/Brick'
import Browser from './Browser'
import Pipe from './Pipe'
import Service from './Service'
import Viewable from './Viewable'

/**
 * Config defaults
 * @type {object}
 */
const defaultConfig = {
  scope: '/',
  serviceEndpoint: 'https://cryptii.com/api',
  serviceWorkerUrl: null
}

/**
 * Singleton instance
 * @type {App}
 */
let instance = null

/**
 * Application
 */
export default class App extends Viewable {
  /**
   * Constructor
   * @param {object} [localConfig={}] Local app configuration
   */
  constructor (localConfig = {}) {
    super()
    this._viewPrototype = AppView
    this._pipe = null

    // Merge config
    this._config = Object.assign(defaultConfig, localConfig)

    // Configure service instance
    this._service = new Service(this._config.serviceEndpoint)

    // Keep a reference to this instance
    instance = this
  }

  /**
   * Bootstraps the application.
   * @param {?object} [pipeData=null] Initial pipe data
   * @return {App} Fluent interface
   */
  run (pipeData = null) {
    // Apply browser class name
    Browser.applyClassName()

    // Create and configure pipe instance
    if (pipeData !== null) {
      this._pipe = Pipe.extract(pipeData, BrickFactory.getInstance())
    } else {
      this._pipe = new Pipe()
      this._pipe.setBrickFactory(BrickFactory.getInstance())
    }

    // Configure pipe service
    this._pipe.setService(this._service)

    // Trigger view creation and initial layout
    const view = this.getView()
    view.layout()
    setTimeout(view.layout.bind(view), 100)

    // Register the service worker
    if (this._config.serviceWorkerUrl && navigator.serviceWorker) {
      navigator.serviceWorker.register(this._config.serviceWorkerUrl, {
        scope: this._config.scope
      })
    }

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
    // Add pipe subview
    view.addSubview(this._pipe.getView())
  }

  /**
   * Returns app singleton instance.
   * @return {App}
   */
  static getInstance () {
    return instance
  }
}
