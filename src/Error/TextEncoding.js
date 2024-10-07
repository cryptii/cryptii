import InvalidInputError from './InvalidInput.js'

/**
 * Errors thrown due to malformed byte encoded text.
 */
export default class TextEncodingError extends InvalidInputError {
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
