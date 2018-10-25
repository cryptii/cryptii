
import InvalidInputError from './InvalidInput'

/**
 * Errors thrown due to malformed byte encoded text.
 */
export default class TextEncodingError extends InvalidInputError {
  /**
   * Class Instance Properties
   */
  byteIndex;

  /**
   * Constructor
   * @param {string} message
   * @param {number} [index=null] Index of invalid byte
   */
  constructor (message, index = null) {
    super(message)
    this.byteIndex = index
  }
}
