import BrickView from './View/Brick.js'
import EventManager from './EventManager.js'
import Form from './Form.js'
import Viewable from './Viewable.js'

/**
 * Abstract element of the pipe
 * @abstract
 */
export default class Brick extends Viewable {
  /**
   * Returns brick meta.
   * @abstract
   * @return {object}
   */
  static getMeta () {
    throw new Error('Brick static method \'getMeta\' has not been overridden.')
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this._pipe = null
    this._viewPrototype = BrickView

    this._settingsForm = new Form()
    this._settingsForm.setDelegate(this)

    this._title = null
    this._hidden = false
  }

  /**
   * Returns the pipe this brick is part of.
   * @return {?Pipe} Pipe instance or null, if brick isn't part of a pipe
   */
  getPipe () {
    return this._pipe
  }

  /**
   * Returns true, if this brick is part of a pipe.
   * @return {boolean}
   */
  hasPipe () {
    return this._pipe !== null
  }

  /**
   * Sets the pipe this brick is part of.
   * @param {?Pipe} pipe Pipe instance this brick is part of
   * @return {Brick} Fluent interface
   */
  setPipe (pipe) {
    this._pipe = pipe
    return this
  }

  /**
   * Returns brick meta.
   * @return {object}
   */
  getMeta () {
    return this.constructor.getMeta()
  }

  /**
   * Returns brick name.
   * @return {string}
   */
  getName () {
    return this.getMeta().name
  }

  /**
   * Returns the brick title.
   * @return {string} Brick title
   */
  getTitle () {
    return this._title === null
      ? this.getMeta().title
      : this._title
  }

  /**
   * Sets the brick title.
   * @param {?string} title Brick title or null to reset
   * @return {Brick} Fluent interface
   */
  setTitle (title) {
    this._title = title && title !== this.getMeta().title ? title : null
    return this
  }

  /**
   * Returns true, if brick is set to be hidden.
   * @return {boolean}
   */
  isHidden () {
    return this._hidden
  }

  /**
   * Sets wether this brick is hidden.
   * @param {boolean} [hidden=true] True, if brick is hidden
   * @return {Brick} Fluent interface
   */
  setHidden (hidden = true) {
    if (this._hidden !== hidden) {
      this._hidden = hidden
      this.hasPipe() && this.getPipe().brickVisibilityDidChange(this, hidden)
    }
    return this
  }

  /**
   * Returns the brick settings form.
   * @return {Form} Settings form
   */
  getSettingsForm () {
    return this._settingsForm
  }

  /**
   * Convenience method for returning the fields of the setting form.
   * @return {Field[]}
   */
  getSettings () {
    return this._settingsForm.getFields()
  }

  /**
   * Adds multiple setting fields to the brick.
   * @param {Field[]|object[]} fieldsOrSpecs Array of field instances or
   * spec objects
   * @return {Brick} Fluent interface
   */
  addSettings (fieldsOrSpecs) {
    this._settingsForm.addFields(fieldsOrSpecs)
    return this
  }

  /**
   * Convenience method for returning the setting field for given name.
   * @param {string} name Setting name
   * @return {?Setting} Setting field or null, if it does not exist
   */
  getSetting (name) {
    return this._settingsForm.getField(name)
  }

  /**
   * Convenience method for adding a setting field to the brick.
   * @param {Field|object} fieldOrSpec Field instance or spec object
   * @throws {Error} If field name is already assigned.
   * @return {Brick} Fluent interface
   */
  addSetting (fieldOrSpec) {
    this._settingsForm.addField(fieldOrSpec)
    return this
  }

  /**
   * Convenience method for returning a named setting value.
   * @param {string} name Setting name
   * @throws {Error} If no setting is assigned to given setting name.
   * @return {mixed} Setting value
   */
  getSettingValue (name) {
    return this._settingsForm.getFieldValue(name)
  }

  /**
   * Convenience method for setting a named setting.
   * @param {string} name Setting name
   * @param {mixed} value Setting value
   * @throws {Error} If no setting is assigned to given setting name.
   * @return {Brick} Fluent interface
   */
  setSettingValue (name, value) {
    this._settingsForm.setFieldValue(name, value)
    return this
  }

  /**
   * Convenience method for returning the current setting value for each visible
   * setting field.
   * @return {object} Object mapping names to setting values
   */
  getSettingValues () {
    return this._settingsForm.getFieldValues()
  }

  /**
   * Applies each setting value in given map.
   * @param {object} namedValues Map of names pointing to setting values
   * @throws {Error} If no setting is assigned to given setting name.
   * @return {Brick} Fluent interface
   */
  setSettingValues (namedValues) {
    this._settingsForm.setFieldValues(namedValues)
    return this
  }

  /**
   * Returns true, if the brick is valid.
   * @return {boolean} True, if valid
   */
  isValid () {
    return this._settingsForm.isValid()
  }

  /**
   * Returns true, if settings matching the given setting names are valid.
   * @param {...names} names Setting names to be validated
   * @return {boolean} True, if valid
   */
  isSettingValid (...names) {
    // Check if there is an invalid setting among the given setting names
    return names.find(name => !this.getSetting(name).isValid()) === undefined
  }

  /**
   * Returns true, if the brick input is randomizable.
   * @return {boolean}
   */
  isRandomizable () {
    return this._settingsForm.isRandomizable()
  }

  /**
   * Randomizes the brick input.
   * @return {Brick} Fluent interface
   */
  randomize () {
    this._settingsForm.randomize()
    return this
  }

  /**
   * Triggered when a settings form field value has changed.
   * @param {Form} form Sender form
   * @param {Field} field Field instance that has been changed
   * @param {mixed} value New field value
   */
  formValueDidChange (form, field, value) {
    if (form === this._settingsForm) {
      // Trigger settings change event
      this.settingValueDidChange(field, value)
      // Notify pipe, if any
      this.hasPipe() && this.getPipe().brickSettingDidChange(this)
    }
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    // Override method
  }

  /**
   * Triggered when view has been created.
   * @protected
   */
  didCreateView (view) {
    // Add settings form as a subview
    view.addSubview(this._settingsForm.getView())
  }

  /**
   * Triggered when menu item has been clicked.
   * @param {BrickView} view Sender
   * @param {string} name Menu item name
   */
  viewMenuItemDidClick (view, name) {
    // Track action
    EventManager.trigger('brickMenuItemClick', { brick: this, menuItem: name })

    // Decide what to do
    switch (name) {
      case 'remove':
        this.getPipe().removeBrick(this)
        break
      case 'hide':
        this.setHidden(true)
        break
      case 'duplicate':
        // TODO Create a UI to communicate that brick duplication is not
        // possible with invalid settings.
        if (this.isValid()) {
          this.getPipe().duplicateBrick(this)
        }
        break
      case 'randomize':
        this.randomize()
        break
    }
  }

  /**
   * Triggered when replace button has been clicked.
   * @param {BrickView} view Sender
   * @protected
   */
  viewReplaceButtonDidClick (view) {
    if (this.hasPipe()) {
      // Track action
      EventManager.trigger('brickReplaceButtonClick', { brick: this })
      // Forward request to pipe
      this.getPipe().brickReplaceButtonDidClick(this)
    }
  }

  /**
   * Serializes brick to a JSON serializable value.
   * @return {mixed} Serialized data
   */
  serialize () {
    const data = {}

    // Name
    data.name = this.getName()

    // Set title, if not using the default
    if (this._title !== null) {
      data.title = this._title
    }

    // Set hidden
    if (this.isHidden()) {
      data.hidden = true
    }

    // Set settings, if any
    const settingsData = this._settingsForm.serializeValues()
    if (Object.keys(settingsData).length > 0) {
      data.settings = settingsData
    }

    return data
  }

  /**
   * Creates a copy of this brick.
   * @throws {Error} If brick is invalid and thus can't be copied.
   * @return {Brick} Brick copy instance
   */
  copy () {
    if (!this.isValid()) {
      throw new Error('Invalid bricks can\'t be copied.')
    }
    const copy = new this.constructor()
    copy.setTitle(this.getTitle())
    copy.setHidden(this.isHidden())
    copy.setSettingValues(this.getSettingValues())
    return copy
  }

  /**
   * Extracts brick from serialized data.
   * @param {mixed} data Serialized data
   * @param {BrickFactory} brickFactory Brick factory instance
   * @throws {Error} If data is malformed.
   * @return {Brick} Extracted brick
   */
  static extract (data, brickFactory) {
    // Verify name
    if (typeof data.name !== 'string') {
      throw new Error(
        'Brick property \'name\' is expected to be of type \'string\'')
    }

    const name = data.name

    // Check if this is a known brick name
    if (!brickFactory.exists(name)) {
      throw new Error(
        `Brick property 'name' refers to an unknown brick '${name}'`)
    }

    // Create brick instance
    const brick = brickFactory.create(name)

    // Handle title property
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        throw new Error(
          'Optional brick property \'title\' is expected to be of ' +
          'type \'string\''
        )
      }
      brick.setTitle(data.title)
    }

    // Handle hidden property
    if (data.hidden !== undefined) {
      if (typeof data.hidden !== 'boolean') {
        throw new Error(
          'Optional brick property \'hidden\' is expected to be of ' +
          'type \'boolean\''
        )
      }
      brick.setHidden(data.hidden)
    }

    // Handle reverse property
    if (data.reverse !== undefined) {
      if (typeof brick.setReverse !== 'function') {
        throw new Error(
          'Optional brick property \'reverse\' can only be set on ' +
          'encoder bricks'
        )
      } else if (typeof data.reverse !== 'boolean') {
        throw new Error(
          'Optional brick property \'reverse\' is expected to be of ' +
          'type \'boolean\''
        )
      }
      brick.setReverse(data.reverse)
    }

    // Apply setting values
    if (data.settings !== undefined) {
      brick.getSettingsForm().extract(data.settings)
    }

    return brick
  }
}
