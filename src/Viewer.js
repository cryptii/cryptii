
import Brick from './Brick'

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
    this._queuedContent = null
    this._queuedCallback = null
  }

  /**
   * Views content.
   * @param {Chain} content
   * @param {function} [done] Called when viewing content has finished.
   * @return {Viewer} Fluent interface
   */
  view (content, done = null) {
    if (!this.areSettingsValid()) {
      throw new Error(`Can't view. At least one setting is invalid.`)
    }

    if (!this.hasView()) {
      // queue view request until view has been created
      this._queuedContent = content
      this._queuedCallback = done
      return this
    }

    content = this.willView(content)

    this.performView(content, () => {
      this.didView(content)
      done && done()
    })

    return this
  }

  /**
   * Triggered before performing view of given content.
   * @protected
   * @param {string} content
   * @return {string} Filtered content
   */
  willView (content) {
    return content
  }

  /**
   * Performs view of given content.
   * @protected
   * @abstract
   * @param {string} content
   * @param {function} done Called when performing view has finished.
   */
  performView (content, done) {
    // abstract method
  }

  /**
   * Triggered after performing view of given content.
   * @protected
   * @abstract
   * @param {string} content
   */
  didView (content) {
    // abstract method
  }

  /**
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    super.didCreateView(view)

    if (this._queuedContent !== null) {
      // perform queued view
      this.view(this._queuedContent, this._queuedCallback)

      // clear queued view
      this._queuedContent = null
      this._queuedCallback = null
    }
  }

  /**
   * Triggered when the content has been changed inside this Viewer.
   * @param {string} content New content
   */
  contentDidChange (content) {
    // report to pipe that viewer content did change
    this.hasPipe() && this.getPipe().viewerContentDidChange(this, content)
  }
}
