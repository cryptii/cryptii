
import BrickFactory from './BrickFactory'
import BrickView from '../../views/Brick'
import EventManager from '../EventManager'
import Field from '../Field/Field'
import FieldSpec from '../Field/FieldSpec'
import Form from '../Form'
import Pipe from '../Pipe'
import StringUtil from '../Util/StringUtil'
import Viewable from '../Viewable'

/**
 * Abstract element of the pipe
 * @todo name, title, meta
 * @abstract
 */
export default class Brick extends Viewable {
  /**
   * React component this model is represented by
   */
  protected viewComponent = BrickView

  /**
   * Pipe instance the brick is attached to
   */
  private pipe?: Pipe

  /**
   * Brick settings form
   */
  private readonly settingsForm: Form

  /**
   * Brick id tracked for rendering purposes
   */
  private id: string

  /**
   * Brick name
   */
  private name?: string

  /**
   * Brick title
   * May be overridden by the child class to set the Brick title
   */
  protected title?: string

  /**
   * Brick hidden state
   */
  private hidden: boolean = false

  /**
   * Constructor
   */
  constructor () {
    super()

    // Assign unique id
    this.id = StringUtil.uniqueId()

    // Configure settings form
    this.settingsForm = new Form()
    this.settingsForm.setDelegate(this)
    this.settingsForm.setParentView(this)
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      id: this.id,
      name: this.name,
      title: this.title || this.name,
      settingsForm: this.settingsForm,
      valid: this.isValid(),
      serialize: this.serialize.bind(this),
      menuItems: [
        { name: 'remove', label: 'Remove' },
        { name: 'hide', label: 'Hide' },
        { name: 'duplicate', label: 'Duplicate' },
        { name: 'randomize', label: 'Randomize' },
      ],
      onMenuItemClick: this.viewMenuItemDidClick.bind(this),
      onDragStart: (event: React.DragEvent<HTMLElement>) => {
        // Populate drag data transfer
        const brickDataJson = JSON.stringify(this.serialize())
        event.dataTransfer.setData('application/vnd.cryptii.brick+json', brickDataJson)
        event.dataTransfer.setData('application/json', brickDataJson)
        event.dataTransfer.effectAllowed = 'copyMove'

        if (this.pipe !== undefined) {
          this.pipe.brickDragStart(this)
        }
      },
      onDragEnd: (event: React.DragEvent<HTMLElement>) => {
        if (this.pipe !== undefined) {
          this.pipe.brickDragEnd(this)
        }
      }
    }
  }

  /**
   * Prepares this brick instance. By overriding this method a brick may define
   * dependencies and their fulfillment completed at instantiation.
   * @param factory - Brick factory calling this method.
   */
  prepare (factory: BrickFactory): void {
    // Needs child class implementation, if necessary
  }

  /**
   * Returns unique brick id.
   */
  getId (): string {
    return this.id
  }

  /**
   * Returns brick name.
   */
  getName (): string {
    return this.name!
  }

  /**
   * Sets the brick name.
   * @param name - Brick name
   */
  setName (name: string) {
    this.name = name
  }

  /**
   * Returns the pipe instance this brick is attached to, if any.
   */
  getPipe (): Pipe | undefined {
    return this.pipe
  }

  /**
   * Sets the pipe instance this brick is attached to.
   * @param pipe - Pipe instance
   */
  setPipe (pipe?: Pipe) {
    this.pipe = pipe
  }

  /**
   * Returns true, when the brick is hidden.
   */
  isHidden (): boolean {
    return this.hidden
  }

  /**
   * Sets wether the brick is hidden.
   * @param hidden - Wether brick is hidden
   */
  setHidden (hidden: boolean): void {
    this.hidden = hidden
    if (this.pipe) {
      this.pipe.brickVisibilityDidChange(this, hidden)
    }
  }

  /**
   * Returns true, if the brick is valid.
   */
  isValid (): boolean {
    return this.settingsForm.isValid()
  }

  /**
   * Returns an object providing properties for each embedded setting value.
   * Through object properties setting values can be accessed and manipulated.
   * @example
   * const variant = brick.settings.variant
   * brick.settings.caseStrategy = 'maintain'
   */
  get settings (): { [index: string] : any } {
    return this.settingsForm.values
  }

  /**
   * Updates the named setting values provided by the given object.
   * Attention: Missing settings get ignored instead of being reset.
   * @param {object} values Named setting values
   * @example
   * brick.settings = {
   *   variant: 'default',
   *   caseStrategy: 'maintain'
   * }
   */
  set settings (values: { [index: string] : any }) {
    this.settingsForm.setFieldValues(values)
  }

  /**
   * Convenience method for returning the brick settings form fields.
   */
  get settingFields (): { [index: string] : Field } {
    return this.settingsForm.fields
  }

  /**
   * Returns the settings form instance
   */
  getSettingsForm (): Form {
    return this.settingsForm
  }

  /**
   * Adds the given array of fields to the settings form.
   * @param settingFields - Array of fields to be added
   */
  addSettings (settingFields: (Field | FieldSpec)[]): void {
    this.settingsForm.addFields(settingFields)
  }

  /**
   * Returns true, if at least one visible setting is randomizable.
   */
  isRandomizable (): boolean {
    return this.settingsForm.isRandomizable()
  }

  /**
   * Randomizes visible randomizable settings.
   */
  randomize (): void {
    this.settingsForm.randomize()
  }

  /**
   * Triggered when a settings form field value has changed.
   * @param form - Sender form
   * @param field - Field instance that has been changed
   * @param value - New field value
   */
  formValueDidChange (form: Form, field: Field, value: any) {
    if (form === this.settingsForm) {
      // Trigger settings change event
      this.settingValueDidChange(field, value)
      // Notify pipe, if any
      if (this.pipe !== undefined) {
        this.pipe.brickSettingDidChange(this)
      }
    }
  }

  /**
   * Triggered when a setting field has changed.
   * @param setting - Sender setting field
   * @param value - New field value
   */
  settingValueDidChange (setting: Field, value: any) {
    // Override method
  }

  /**
   * Triggered when menu item has been clicked.
   * @param {BrickView} view Sender
   * @param {string} name Menu item name
   */
  viewMenuItemDidClick (item: any, event: Event) {
    // Decide what to do
    console.log('item', item)
    switch (item.name) {
      case 'remove':
        if (this.pipe !== undefined) {
          this.pipe.removeBrick(this)
        }
        break
      case 'hide':
        this.hidden = true
        break
      case 'duplicate':
        // TODO Create a UI to communicate that brick duplication is not
        // possible with invalid settings.
        if (this.isValid() && this.pipe !== undefined) {
          this.pipe.duplicateBrick(this)
        }
        break
      case 'randomize':
        this.randomize()
        break
    }
  }

  /**
   * Triggered when replace button has been clicked.
   */
  viewReplaceButtonDidClick () {
    if (this.pipe !== undefined) {
      // Track action
      EventManager.trigger('brickReplaceButtonClick', { brick: this })
      // Forward request to pipe
      this.pipe.brickReplaceButtonDidClick(this)
    }
  }

  /**
   * Serializes brick to a JSON serializable value.
   * @returns Serialized data
   */
  serialize (): any {
    const data: any = {}

    // Name
    data.name = this.name

    // Set title, if not using the default
    if (this.title !== undefined) {
      data.title = this.title
    }

    // Set hidden state
    if (this.hidden) {
      data.hidden = true
    }

    // Set settings, if any
    const settingsData = this.settingsForm.serializeValues()
    if (Object.keys(settingsData).length > 0) {
      data.settings = settingsData
    }

    return data
  }

  /**
   * Applies configuration from serialized brick data.
   * @param data - Serialized data
   * @throws {Error} If serialized data is invalid
   */
  extract (data: any): void {
    // Handle name property
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        throw new Error(
          `Optional brick property 'name' is expected to be of type 'string'`)
      }
      this.name = data.name
    }

    // Handle title property
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        throw new Error(
          `Optional brick property 'title' is expected to be of type 'string'`)
      }
      this.title = data.title
    }

    // Handle hidden property
    if (data.hidden !== undefined) {
      if (typeof data.hidden !== 'boolean') {
        throw new Error(
          `Optional brick property 'hidden' is expected to be of type 'boolean'`)
      }
      this.hidden = data.hidden
    }

    // Apply setting values
    if (data.settings !== undefined) {
      this.settingsForm.extract(data.settings)
    }
  }

  /**
   * Prepares this brick type. By overriding this method a brick may define
   * dependencies and their fulfillment completed only once for all instances.
   * @param factory - Brick factory calling this method. It may be
   * used to resolve dependencies to other bricks.
   */
  static async prepare (factory: BrickFactory): Promise<void> {
    // Needs child class implementation, if necessary
  }
}
