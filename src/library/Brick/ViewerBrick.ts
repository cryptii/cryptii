
import Brick from './Brick'
import Chain, { ChainValueType } from '../Chain'
import InvalidInputError from '../Error/InvalidInputError'

/**
 * Abstract brick for viewing and editing content.
 * @abstract
 */
export default class Viewer extends Brick {
  /**
   * Content to be shown.
   */
  private content: Chain = Chain.from('')

  private error?: Error

  /**
   * Views content.
   * @param content Content to be viewed
   * @return {Promise} Resolves when completed.
   */
  async view (content: Chain) {
    try {
      // check for invalid settings
      let invalidSettings = this.getSettingsForm().getInvalidFields()
      if (invalidSettings.length > 0) {
        throw new InvalidInputError(
          `Can't view content with invalid settings: ` +
          invalidSettings.map(setting => setting.getLabel()).join(', '))
      }

      this.setContent(content, this.getPipe())
      this.updateView()

      // perform actual view
      await this.performView(content)

      // clear error
      if (this.error !== undefined) {
        this.error = undefined
        this.updateView()
      }
    } catch (error) {
      this.error = error
      this.updateView()
      throw error
    }
  }

  /**
   * Performs view of given content.
   * @protected
   * @abstract
   * @param content - Content to view
   * @return {void|Promise} Resolves when completed.
   */
  async performView (content: Chain) {
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
      if (this.error !== undefined) {
        this.error = undefined
        this.updateView()
      }
    } catch (error) {
      // set error
      this.error = error
      this.updateView()
      // throw it if needed
      if (throwAll || !(error instanceof InvalidInputError)) {
        throw error
      }
    }
    return this
  }

  /**
   * Returns the content to be shown.
   */
  getContent (): Chain {
    return this.content
  }

  /**
   * Sets the content to be shown.
   * @param content - New content
   * @param sender - Sender instance
   */
  setContent (content: ChainValueType, sender: any = this): void {
    this.content = Chain.from(content)
    this.updateView()
    if (this.getPipe() !== undefined && this.getPipe() !== sender) {
      this.getPipe().viewerContentDidChange(this, content)
    }
  }

  /**
   * Returns latest error.
   * @return {?Error}
   */
  getError () {
    return this.error
  }
}
