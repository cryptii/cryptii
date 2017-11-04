
import Brick from './Brick'
import InvalidInputError from './Error/InvalidInput'

/**
 * Abstract Brick for viewing and editing content.
 * @abstract
 */
export default class Viewer extends Brick {
  /**
   * Brick constructor
   */
  constructor () {
    super()
    this._queuedContent = null
    this._queuedCallback = null

    this._error = null
  }

  /**
   * Views content.
   * @param {Chain} content
   * @param {function} [done] Called when viewing content has finished.
   * @return {Viewer} Fluent interface
   */
  view (content, done = null) {
    this.dare(() => {
      // check for invalid settings
      let invalidSettings = this.getInvalidSettings()
      if (invalidSettings.length > 0) {
        throw new InvalidInputError(
          `Can't view content with invalid settings: ` +
          invalidSettings.map(setting => setting.getLabel()).join(', '))
      }

      if (!this.hasView()) {
        // queue view request until view has been created
        this._queuedContent = content
        this._queuedCallback = done
        return this
      }

      content = this.willView(content)

      this.performView(content, error => {
        this.didView(content)
        this._error = error || null
        this.updateView()
        done && done()
      })
    }, true)
    return this
  }

  /**
   * Runs callback safely, catching and handling thrown errors.
   * The method is called 'dare' because 'try' is a reserved keyword.
   * TODO Find a better solution for error handling inside Viewers.
   * @param {function} callback Callback to execute.
   * @param {boolean} throwAll Wether to throw all errors
   * @return {Viewer} Fluent interface
   */
  dare (callback, throwAll = false) {
    try {
      // run callback
      callback()
      // clear error
      if (this._error !== null) {
        this._error = null
        this.updateView()
      }
    } catch (error) {
      // set error
      this._error = error
      this.updateView()
      // throw it if needed
      if (throwAll || !(error instanceof InvalidInputError)) {
        throw error
      }
    }
    return this
  }

  /**
   * Returns latest error.
   * @return {?Error}
   */
  getError () {
    return this._error
  }

  /**
   * Triggered before performing view of given content.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  willView (content) {
    return content
  }

  /**
   * Performs view of given content.
   * @protected
   * @abstract
   * @param {string} content
   * @param {function} done Called when performing view has finished.
   */
  performView (content, done) {
    // abstract method
  }

  /**
   * Triggered after performing view of given content.
   * @protected
   * @abstract
   * @param {string} content
   */
  didView (content) {
    // abstract method
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    super.didCreateView(view)

    if (this._queuedContent !== null) {
      // perform queued view
      this.view(this._queuedContent, this._queuedCallback)

      // clear queued view
      this._queuedContent = null
      this._queuedCallback = null
    }
  }

  /**
   * Triggered when the content has been changed inside this Viewer.
   * @param {string} content New content
   */
  contentDidChange (content) {
    // report to pipe that viewer content did change
    this.hasPipe() && this.getPipe().viewerContentDidChange(this, content)
  }
}
