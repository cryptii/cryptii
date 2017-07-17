
import Brick from './Brick'
import Chain from './Chain'

/**
 * Abstract Brick for viewing and editing content.
 * @abstract
 */
export default class Viewer extends Brick {
  /**
   * Brick constructor
   */
  constructor () {
    super()
    this._content = new Chain()
  }

  /**
   * Views content.
   * @param {Chain} content
   * @return {Viewer} Fluent interface
   */
  view (content) {
    this._content = content
    return this
  }

  /**
   * Returns currently viewed content.
   * @return {Chain}
   */
  getContent () {
    return this._content
  }

  /**
   * Triggered when the content has been changed inside this Viewer.
   * @param {string} content New content
   * @return {Viewer} Fluent interface
   */
  contentDidChange (content) {
    this._content = content
    this.hasPipe() && this.getPipe().viewerContentDidChange(this, content)
    return this
  }
}
