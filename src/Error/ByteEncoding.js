
import InvalidInputError from './InvalidInput'

/**
 * Errors thrown due to malformed text encoded bytes.
 */
export default class ByteEncodingError extends InvalidInputError {
  /**
   * Class Instance Properties
   */
  index;

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
