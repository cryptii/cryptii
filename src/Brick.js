
import BrickView from './View/Brick'
import Setting from './Setting'
import SettingFactory from './Factory/Setting'

/**
 * Abstract element of the Pipe.
 * @abstract
 */
export default class Brick {
  /**
   * Brick constructor
   */
  constructor () {
    this._pipe = null
    this._settings = []
    this._view = null
  }

  /**
   * Registers a single or multiple Settings.
   * @example
   * // register number setting inside brick constructor
   * constructor () {
   *   super()
   *   this.registerSetting({
   *     name: 'a',
   *     type: 'number',
   *     value: 5,
   *     options: { integer: true, min: 1 }
   *   })
   * }
   * @protected
   * @param {...Setting|Object|Setting[]|Object[]} settingOrSpec
   * Single or array of Setting objects or Setting specifications described
   * at {@link SettingFactory.create}.
   * @throws Throws an error if specification is malformed.
   * @throws Throws an error if Setting type has not been registered.
   * @throws Throws an error if Setting with given name is already registered.
   * @return {Brick} Fluent interface
   */
  registerSetting (...settingOrSpec) {
    // resolve single arg (preventing infinite loop)
    if (settingOrSpec.length === 1) {
      settingOrSpec = settingOrSpec[0]
    }

    // handle multiple settings or specifications
    if (Array.isArray(settingOrSpec)) {
      settingOrSpec.forEach(settingOrSpec =>
        this.registerSetting(settingOrSpec))
      return this
    }

    // retrieve setting object
    const setting = (settingOrSpec instanceof Setting)
      ? settingOrSpec
      : SettingFactory.getInstance().create(settingOrSpec)

    // check if name already exists
    if (this.findSetting(setting.getName()) !== null) {
      throw new Error(
        `Setting with name '${setting.getName()}' has already ` +
        `been registered to Brick.`)
    }

    // register setting
    this._settings.push(setting)
    setting.setDelegate(this)
    return this
  }

  /**
   * Finds Setting with given name.
   * @param {string} name Setting name to search for.
   * @return {?Setting} Returns Setting or null if not found.
   */
  findSetting (name) {
    return this._settings.find(setting => setting.getName() === name) || null
  }

  /**
   * Convenience method for finding a Setting and returning its value.
   * @param {string} name Setting name to search for.
   * @throws Throws an error if Setting with given name does not exist.
   * @return {mixed} Setting value.
   */
  getSettingValue (name) {
    const setting = this.findSetting(name)
    if (setting === null) {
      throw new Error(`Unknown Setting with name '${setting.getName()}'`)
    }
    return setting.getValue()
  }

  /**
   * Convenience method for finding a Setting and setting its value.
   * @param {string} name Setting name to search for.
   * @param {mixed} value Setting value
   * @throws Throws an error if Setting with given name does not exist.
   * @return {Brick} Fluent interface
   */
  setSettingValue (name, value) {
    const setting = this.findSetting(name)
    if (setting === null) {
      throw new Error(`Unknown Setting with name '${setting.getName()}'`)
    }
    setting.setValue(value)
    return this
  }

  /**
   * Sets multiple Setting values by Object.
   * @param {Object} settings Object mapping Setting names to their values.
   * @throws Throws an error if Setting with given name does not exist.
   * @return {Brick} Fluent interface
   */
  setSettingValues (nameValuePairs) {
    // set each setting value
    Object.keys(nameValuePairs).forEach(name =>
      this.setSettingValue(name, nameValuePairs[name]))
    return this
  }

  /**
   * Triggered when a setting value has changed.
   * @abstract
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Brick} Fluent interface
   */
  settingValueDidChange (setting, value) {
    // abstract method
  }

  /**
   * Returns the Pipe.
   * @return {?Pipe}
   */
  getPipe () {
    return this._pipe
  }

  /**
   * Returns true, if pipe is set.
   * @return {boolean} True, if pipe is set.
   */
  hasPipe () {
    return this._pipe !== null
  }

  /**
   * Sets the Pipe.
   * @param {?Pipe} pipe
   * @return {Brick} Fluent interface
   */
  setPipe (pipe) {
    this._pipe = pipe
    return this
  }

  /**
   * Returns view.
   * @return {View}
   */
  getView () {
    if (this._view === null) {
      this._view = this.createView()
    }
    return this._view
  }

  /**
   * Creates view.
   * @protected
   * @return {View} Newly created view.
   */
  createView () {
    let view = new BrickView()
    return view
  }

  /**
   * Serializes Brick to make it JSON serializable
   * @return {mixed} Serialized data.
   */
  serialize () {
    // TODO needs implementation
    return []
  }

  /**
   * Extracts Brick from structured data.
   * @param {mixed} data Structured data.
   * @return {Brick} Extracted Brick.
   */
  static extract (data) {
    // TODO needs implementation
    return new Brick()
  }
}
