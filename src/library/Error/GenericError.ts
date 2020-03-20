
/**
 * Generic, extendable error.
 * Requires babel-plugin-transform-builtin-extend babel plugin.
 * See: {@link https://stackoverflow.com/questions/31089801/}
 */
export default class GenericError extends Error {
  /**
   * Constructor
   * @param message - Error message
   */
  constructor (message: string) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}
