import AppView from './View/App.js'
import BrickFactory from './Factory/Brick.js'
import EnvUtil from './EnvUtil.js'
import Pipe from './Pipe.js'
import Service from './Service.js'
import Viewable from './Viewable.js'

/**
 * Config defaults
 * @type {object}
 */
const defaultConfig = {
  version: 'unknown',
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

    // Configure service worker, if supported
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      if (this._config.serviceWorkerUrl) {
        // Register the service worker
        navigator.serviceWorker.register(this._config.serviceWorkerUrl, {
          scope: this._config.scope
        })
      } else {
        // Unregister existing service workers
        navigator.serviceWorker.getRegistrations().then(registrations =>
          registrations.forEach(registration => registration.unregister()))
      }
    }

    // Listen for the debug shortcut `Ctrl+I`
    if (EnvUtil.isBrowser()) {
      document.addEventListener('keydown', evt => {
        if (evt.ctrlKey && evt.key === 'i') {
          evt.preventDefault()
          window.alert(this.debug())
        }
      })
    }

    return this
  }

  /**
   * Composes a JSON string containing debug information about the current app
   * state useful for bug reports.
   * @return {string}
   */
  debug () {
    return JSON.stringify({
      version: this._config.version,
      pipe: this.getPipe().serialize()
    })
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
