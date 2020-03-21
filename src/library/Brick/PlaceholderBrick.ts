
import Brick from './Brick'
import BrickFactory from './BrickFactory'
import Pipe from '../Pipe'
import PlaceholderBrickView from '../../views/BrickPlaceholder'

/**
 * This is a special Brick instance that is the representative of the instance
 * currently being loaded or resolved. Loading new Brick instances may take time
 * due to slow network requests or they may fail completely. Placeholder Bricks
 * store the serialized brick data and track the loading status. When loading
 * has successfully completed the Brick replaces itself inside the pipe it is
 * currently attached to.
 */
export default class PlaceholderBrick extends Brick {
  /**
   * React component this model is represented by
   */
  protected viewComponent = PlaceholderBrickView

  /**
   * Serialized data of the brick represented by this placeholder
   */
  private data: any

  /**
   * Brick factory used to resolve this placeholder
   */
  private factory: BrickFactory

  /**
   * Replacement brick instance or promise depending on loading state
   */
  private replacement?: Brick | Promise<Brick>

  /**
   * Last loading error, if any
   */
  private error?: Error

  private errorType?: string

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      ...super.compose(),
      loading: this.replacement instanceof Promise,
      errorType: this.errorType,
      error: this.error !== undefined ? this.error.message : undefined,
      onRetryClick: this.load.bind(this)
    }
  }

  /**
   * Trigger initial Brick loading.
   * @param factory - Brick factory calling this method.
   */
  prepare (factory: BrickFactory): void {
    this.factory = factory
    this.load()
  }

  /**
   * Initiates Brick loading
   */
  load (): void {
    if (this.replacement instanceof Promise) {
      // Brick instance is already being loaded
      return
    }

    this.error = undefined
    this.replacement = this.factory.loadAndCreate(this.data)

    this.replacement.then(brick => {
      this.replacement = brick

      // Replace self in pipe currently attached to
      const pipe = this.getPipe()
      if (pipe !== undefined) {
        pipe.replaceBrick(this, this.replacement)
      }
    }, error => {
      this.replacement = undefined
      this.errorType = 'error'
      this.error = error

      if (error.code === 'MODULE_NOT_FOUND') {
        this.errorType = 'not-found'
      }

      this.updateView()
    })

    this.updateView()
  }

  /**
   * Sets the pipe instance this brick is attached to.
   * @param pipe - Pipe instance
   */
  setPipe (pipe?: Pipe) {
    super.setPipe(pipe)
    if (pipe !== undefined &&
        this.replacement !== undefined &&
        !(this.replacement instanceof Promise)) {
      pipe.replaceBrick(this, this.replacement)
    }
  }

  /**
   * Applies configuration from serialized brick data.
   * @param data - Serialized data
   */
  extract (data: any): void {
    this.data = data

    if (typeof data.name === 'string') {
      this.setName(data.name)
    }

    if (typeof data.title === 'string') {
      this.title = data.title
    }
  }

  /**
   * Serializes brick to a JSON serializable value.
   * @returns Serialized data
   */
  serialize (): any {
    // When serializing this placeholder brick while it is being loaded,
    // the data of the requested brick should be returned
    return this.data
  }
}
