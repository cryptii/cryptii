
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

  /**
   * Triggered when the content got changed by this Viewer.
   * @param {string} content New content
   * @return {Viewer} Fluent interface
   */
  contentDidChange (content) {
    // notify delegate
    this.getPipe() && this.getPipe().viewerContentDidChange(this, content)
    return this
  }
}
