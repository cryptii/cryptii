
import Analytics from './Analytics'
import BrickView from './View/Brick'
import Setting from './Setting'
import SettingFactory from './Factory/Setting'
import Viewable from './Viewable'

/**
 * Abstract element of the Pipe.
 * @abstract
 */
export default class Brick extends Viewable {
  /**
   * Returns brick meta.
   * @abstract
   * @return {object}
   */
  static getMeta () {
    throw new Error(`Brick static method 'getMeta' has not been overridden.`)
  }

  /**
   * Brick constructor
   */
  constructor () {
    super()
    this._settings = []
    this._viewPrototype = BrickView
    this._pipe = null
  }

  /**
   * Returns brick meta.
   * @return {object}
   */
  getMeta () {
    return this.constructor.getMeta()
  }

  /**
   * Returns Setting objects registered to this Brick.
   * @return {Setting[]}
   */
  getSettings () {
    return this._settings
  }

  /**
   * Finds Setting with given name.
   * @param {string} name Setting name to search for.
   * @return {?Setting} Returns Setting or null if not found.
   */
  getSetting (name) {
    return this._settings.find(setting => setting.getName() === name) || null
  }

  /**
   * Convenience method for finding a Setting and returning its value.
   * @param {string} name Setting name to search for.
   * @throws Throws an error if Setting with given name does not exist.
   * @return {mixed} Setting value.
   */
  getSettingValue (name) {
    const setting = this.getSetting(name)
    if (setting === null) {
      throw new Error(`Unknown Setting with name '${name}'`)
    }
    return setting.getValue()
  }

  /**
   * Returns an object mapping setting names to their values.
   * @return {object}
   */
  getSettingValues () {
    let settingValues = {}
    this.getSettings()
      .filter(setting => setting.isVisible())
      .forEach(setting => {
        settingValues[setting.getName()] = setting.getValue()
      })
    return settingValues
  }

  /**
   * Returns an array of invalid Setting objects.
   * @return {Setting[]}
   */
  getInvalidSettings () {
    return this._settings.filter(setting => !setting.isValid())
  }

  /**
   * Returns true if this Brick's Settings are valid.
   * @return {boolean}
   */
  areSettingsValid () {
    return this.getInvalidSettings().length === 0
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
    let setting = settingOrSpec
    if (!(settingOrSpec instanceof Setting)) {
      // apply default priority
      if (settingOrSpec.priority === undefined) {
        settingOrSpec.priority = -this._settings.length
      }
      // create setting instance
      setting = SettingFactory.getInstance().create(settingOrSpec)
    }

    // check if name already exists
    if (this.getSetting(setting.getName()) !== null) {
      throw new Error(
        `Setting with name '${setting.getName()}' has already ` +
        `been registered to Brick.`)
    }

    // register setting
    this._settings.push(setting)
    setting.setDelegate(this)

    // add setting as subview
    if (setting.isVisible()) {
      this.hasView() && this.getView().addSubview(setting.getView())
    }

    return this
  }

  /**
   * Convenience method for finding a Setting and setting its value.
   * @param {string} name Setting name to search for.
   * @param {mixed} value Setting value
   * @throws Throws an error if Setting with given name does not exist.
   * @return {Brick} Fluent interface
   */
  setSettingValue (name, value) {
    const setting = this.getSetting(name)
    if (setting === null) {
      throw new Error(`Unknown Setting with name '${name}'`)
    }
    setting.setValue(value)
    return this
  }

  /**
   * Sets multiple Setting values by Object.
   * @param {Object} nameValuePairs Object mapping Setting names to values.
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
   * Override is required to call super.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   */
  settingValueDidChange (setting, value) {
    // notify delegate
    this.hasPipe() && this.getPipe().brickSettingDidChange(this)
  }

  /**
   * Triggered when a setting layout property has changed.
   * @protected
   * @param {Setting} setting
   * @return {Encoder} Fluent interface
   */
  settingNeedsLayout (setting) {
    if (!this.hasView()) {
      // nothing to do
      return
    }

    // remove setting from superview
    setting.getView() && setting.getView().removeFromSuperview()

    if (setting.isVisible()) {
      // add setting back to view
      this.getView().addSubview(setting.getView())
    }
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
   * Triggered when view has been created.
   * @protected
   * @param {View} view
   */
  didCreateView (view) {
    // add each setting as subview
    this._settings
      .filter(setting => setting.isVisible())
      .forEach(setting => view.addSubview(setting.getView()))
  }

  /**
   * Triggered when remove button has been clicked.
   * @protected
   * @param {View} view
   */
  viewRemoveButtonDidClick (view) {
    if (this.hasPipe()) {
      // remove self from pipe
      this.getPipe().removeBrick(this)

      Analytics.trackEvent('brick_remove', {
        'event_category': 'bricks',
        'event_action': 'remove',
        'event_label': this.getMeta().name
      })
    }
  }

  /**
   * Triggered when a brick has been selected inside selection view.
   * @param {View} view
   * @param {string} name
   */
  selectionViewDidSelect (view, name) {
    if (this.getMeta().name === name) {
      return this.getView().toggleSelection(false)
    }

    if (this.hasPipe()) {
      // replace self by new brick
      this.getPipe().replaceBrick(this, name)
    }
  }

  /**
   * Serializes Brick to a JSON serializable object.
   * @return {mixed} Serialized data
   */
  serialize () {
    return {
      name: this.getMeta().name,
      settings: this.getSettingValues()
    }
  }

  /**
   * Extracts Brick from serialized data.
   * @param {mixed} data Serialized data
   * @param {BrickFactory} brickFactory Brick factory instance.
   * @throws {Error} Throws an error if data is malformed.
   * @return {Brick} Extracted Brick.
   */
  static extract (data, brickFactory) {
    // read brick name
    if (typeof data.name !== 'string') {
      throw new Error(
        `Malformed brick data: Attribute 'name' is expected to be a string`)
    }

    let name = data.name

    // check if brick name exists
    if (!brickFactory.exists(name)) {
      throw new Error(
        `Malformed brick data: Unknown brick with name '${name}'`)
    }

    // create brick instance
    let brick = brickFactory.create(name)

    // read and apply reverse
    if (typeof data.reverse !== 'undefined' &&
        typeof data.reverse !== 'boolean') {
      throw new Error(
        `Malformed brick data: Attribute 'reverse' is expected to be boolean`)
    }

    if (data.reverse === true) {
      if (typeof brick.setReverse !== 'function') {
        throw new Error(
          `Malformed brick data: Brick with name '${name}' can't be reversed`)
      }
      brick.setReverse(true)
    }

    // apply setting values
    if (data.settings !== undefined) {
      brick.setSettingValues(data.settings)
    }

    return brick
  }
}
