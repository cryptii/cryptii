
import Factory from '../Factory'

// package settings
import AlphabetSetting from '../Setting/Alphabet'
import BooleanSetting from '../Setting/Boolean'
import ByteSetting from '../Setting/Byte'
import EnumSetting from '../Setting/Enum'
import NumberSetting from '../Setting/Number'
import TextSetting from '../Setting/Text'

// singleton instance
let instance = null

/**
 * Factory for setting objects
 */
export default class SettingFactory extends Factory {
  /**
   * Setting factory constructor
   */
  constructor () {
    super()

    // gather package brick classes
    const invokables = {
      alphabet: AlphabetSetting,
      boolean: BooleanSetting,
      bytes: ByteSetting,
      enum: EnumSetting,
      number: NumberSetting,
      text: TextSetting
    }

    // register each brick
    for (let name in invokables) {
      this.register(name, invokables[name])
    }
  }

  /**
   * Configure a setting object based on the provided specification.
   * @example
   * let variantSetting = SettingFactory.getInstance().create({
   *   name: 'variant',
   *   type: 'enum',
   *   options: {...}
   * })
   * @param {Object} spec Specification
   * @param {string} spec.name Name to provide to the setting
   * @param {string} spec.type Setting factory identifier to use
   * @throws Throws an error if specification is malformed.
   * @throws Throws an error if Setting type has not been registered.
   * @return {Setting} Configured setting object
   */
  create (spec) {
    // validate name
    if (!spec.name) {
      throw new Error(`Setting specification requires 'name' field.`)
    }

    // validate type
    if (!spec.type) {
      throw new Error(`Setting specification requires 'type' field.`)
    } else if (!this.exists(spec.type)) {
      throw new Error(`Unknown Setting type '${spec.type}'.`)
    }

    // create setting object
    return super.create(spec.type, spec.name, spec)
  }

  /**
   * Get setting factory singleton instance.
   * @return {SettingFactory}
   */
  static getInstance () {
    if (instance === null) {
      instance = new SettingFactory()
    }
    return instance
  }
}
