
import ReactDOM from 'react-dom'
import AppView from '../views/App'
import BrickFactory from './Brick/BrickFactory'
import EnvUtil from './Util/EnvUtil'
import Pipe from './Pipe'
import Service from './Service'
import Viewable from './Viewable'
import LibraryPanel from './Panel/LibraryPanel'


/**
 * Application instance
 */
export default class App extends Viewable {
  /**
   * Default app config
   * @todo Inject package version while building
   */
  private static defaultConfig = {
    version: '5.0.0-alpha',
    scope: '/',
    serviceEndpoint: 'https://cryptii.com/api',
    serviceWorkerUrl: null
  }

  /**
   * Static shared instance
   */
  private static sharedInstance?: App

  /**
   * React component this model is represented by
   */
  protected viewComponent = AppView

  /**
   * Root HTML element the app is rendered in
   */
  private readonly rootElement?: Element

  /**
   * App config
   */
  private readonly config: any

  /**
   * Pipe instance
   */
  private pipe?: Pipe

  /**
   * Side panel instance
   */
  private panel?: any

  /**
   * Constructor. Configures App instance.
   * @param config - Local app configuration
   * @param rootElement - Root element the app shall be rendered into
   */
  constructor (config = {}, rootElement?: Element) {
    super()
    this.config = Object.assign(App.defaultConfig, config)
    this.rootElement = rootElement

    // Keep a reference to this shared instance
    App.sharedInstance = this

    // TODO: Move this to a better place
    this.panel = new LibraryPanel()
    this.panel.setParentView(this)
  }

  /**
   * Bootstraps the application.
   * @param pipeData - Initial pipe data
   */
  async run (pipeData: any): Promise<void> {
    // Create and configure main pipe instance
    // The brick factory may need to wait for external requests to complete so
    // this might take a while
    this.pipe = new Pipe()
    this.pipe.setBrickFactory(BrickFactory.getSharedInstance())
    this.pipe.setParentView(this)

    // Extract pipe
    if (pipeData) {
      this.pipe.extract(pipeData)
    }

    // Trigger initial view rendering
    this.updateView()

    // Place browser attribute
    EnvUtil.placeBrowserAttribute()

    // Register an event listener for the debug shortcut `Ctrl+I`
    if (EnvUtil.isBrowser()) {
      document.addEventListener('keydown', evt => {
        if (evt.ctrlKey && evt.key === 'i') {
          evt.preventDefault()
          alert(this.debug())
        }
      })
    }
  }

  /**
   * Updates the view
   */
  updateView (): void {
    super.updateView()

    // Render the app view including its subviews to the DOM
    if (this.rootElement !== undefined) {
      ReactDOM.render(this.render(), this.rootElement);
    }
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      panel: this.panel !== undefined ? this.panel.render() : undefined,
      pipe: this.pipe !== undefined ? this.pipe.render() : undefined,
      onShareClick: type => {
        console.log('Share link click', type)
      }
    }
  }

  /**
   * Composes a JSON string containing debug information about the current app
   * state useful for bug reports.
   * @returns JSON string
   */
  debug (): string {
    return JSON.stringify({
      version: this.config.version,
      env: EnvUtil.identify(),
      pipe: this.pipe !== undefined
        ? this.pipe.serialize()
        : null
    })
  }

  /**
   * Lazily creates a shared app instance and returns it.
   * @returns Shared App instance
   */
  static getSharedInstance (): App {
    if (this.sharedInstance === undefined) {
      this.sharedInstance = new App()
    }
    return this.sharedInstance
  }
}
