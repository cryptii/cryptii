
import InvalidInputError from '../Error/InvalidInputError'

/**
 * Errors thrown in encoders
 */
export default class EncoderError extends InvalidInputError {
  /**
   * Index at which the error occured
   */
  index?: number

  /**
   * Constructor
   * @param message - Error message
   * @param index - Index at which the error occured
   */
  constructor (message: string, index?: number) {
    super(message)
    this.index = index
  }
}
