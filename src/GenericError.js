/**
 * Generic, extendable error.
 * Requires babel-plugin-transform-builtin-extend babel plugin.
 * @see https://stackoverflow.com/questions/31089801/
 */
export default class GenericError extends Error {
  /**
   * Constructor
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}
