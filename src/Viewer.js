import Brick from './Brick.js'
import InvalidInputError from './Error/InvalidInput.js'

/**
 * Abstract brick for viewing and editing content.
 * @abstract
 */
export default class Viewer extends Brick {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._queuedContent = null
    this._error = null
  }

  /**
   * Views content.
   * @param {Chain} content
   * @return {Promise} Resolves when completed.
   */
  async view (content) {
    try {
      // check for invalid settings
      const invalidSettings = this.getSettingsForm().getInvalidFields()
      if (invalidSettings.length > 0) {
        throw new InvalidInputError(
          'Can\'t view content with invalid settings: ' +
          invalidSettings.map(setting => setting.getLabel()).join(', '))
      }

      if (!this.hasView()) {
        // run view as soon as the view is being created
        this._queuedContent = content
        return
      }

      // perform actual view
      content = await this.willView(content)
      await this.performView(content)
      await this.didView(content)

      // clear error
      if (this._error !== null) {
        this._error = null
        this.updateView()
      }
    } catch (error) {
      this._error = error
      this.updateView()
      throw error
    }
  }

  /**
   * Triggered before performing view of given content.
   * @protected
   * @param {string} content
   * @return {Chain|Promise} Filtered content
   */
  async willView (content) {
    return content
  }

  /**
   * Performs view of given content.
   * @protected
   * @abstract
   * @param {string} content
   * @return {void|Promise} Resolves when completed.
   */
  async performView (content) {
    // abstract method
  }

  /**
   * Triggered after performing view of given content.
   * @protected
   * @abstract
   * @return {void|Promise} Resolves when completed.
   */
  async didView (content) {
    // abstract method
  }

  /**
   * Runs callback safely, catching and handling thrown errors.
   * The method is called 'dare' because 'try' is a reserved keyword.
   * @param {function} callback Function to be executed
   * @param {boolean} throwAll Wether to throw all errors
   * @return {Viewer} Fluent interface
   */
  async dare (callback, throwAll = false) {
    try {
      // run callback
      await callback()
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
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    super.didCreateView(view)
    if (this._queuedContent !== null) {
      // perform queued view
      this.view(this._queuedContent)
      // clear queued view
      this._queuedContent = null
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
