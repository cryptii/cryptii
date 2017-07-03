
import Brick from './Brick'

/**
 * Abstract Brick for viewing and editing content.
 * @abstract
 */
export default class Viewer extends Brick {
  /**
   * Views content.
   * @param {Chain} content
   * @return {Viewer} Fluent interface
   */
  view (content) {
    return this
  }
}
