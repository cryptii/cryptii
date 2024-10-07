// shared instance
let sharedInstance = null

/**
 * Class managing events and event handlers
 */
export default class EventManager {
  /**
   * Constructor
   */
  constructor () {
    this._observerNames = []
    this._observerCallbacks = []
  }

  /**
   * Notifies observers about given event.
   * @param {string} name Event name
   * @param {object} [data] Event data
   * @return {EventManager} Fluent interface
   */
  trigger (name, data = null) {
    let index = 0
    while ((index = this._observerNames.indexOf(name, index)) !== -1) {
      this._observerCallbacks[index](name, data)
      index++
    }
    return this
  }

  /**
   * Subscribes to given events.
   * @param {string} name Event name
   * @param {Function} callback
   * @return {EventManager} Fluent interface
   */
  subscribe (name, callback) {
    this._observerNames.push(name)
    this._observerCallbacks.push(callback)
    return this
  }

  /**
   * Unsubscribes given callback from given event.
   * @param {string} name Event name
   * @param {Function} callback
   * @return {EventManager} Fluent interface
   */
  unsubscribe (name, callback) {
    let index = 0
    while ((index = this._observerNames.indexOf(name, index)) !== -1) {
      if (this._observerCallbacks[index] === callback) {
        this._observerNames.splice(index, 1)
        this._observerCallbacks.splice(index, 1)
      } else {
        index++
      }
    }
    return this
  }

  /**
   * Returns shared event manager instance.
   * @return {EventManager}
   */
  static getSharedInstance () {
    if (sharedInstance === null) {
      sharedInstance = new EventManager()
    }
    return sharedInstance
  }

  /**
   * Notifies observers of the shared instance about given event.
   * @param {string} name Event name
   * @param {object} [data] Event data
   * @return {EventManager} Fluent interface
   */
  static trigger (name, data = null) {
    return EventManager.getSharedInstance().trigger(name, data)
  }
}
