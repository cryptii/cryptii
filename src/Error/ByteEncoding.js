import InvalidInputError from './InvalidInput.js'

/**
 * Errors thrown due to malformed text encoded bytes.
 */
export default class ByteEncodingError extends InvalidInputError {
  /**
   * Constructor
   * @param {string} message
   * @param {number} [index=null] Index of invalid byte
   */
  constructor (message, index = null) {
    super(message)
    this.index = index
  }
}
