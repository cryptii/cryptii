
import GenericError from '../GenericError'

/**
 * Errors thrown due to malformed bytes in given text encoding.
 */
export default class TextEncodingError extends GenericError {
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
