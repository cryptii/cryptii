
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
 * Factory for Setting objects.
 */
export default class SettingFactory extends Factory {
  /**
   * Setting Factory constructor.
   */
  constructor () {
    super()

    // register package settings
    this.register('alphabet', AlphabetSetting)
    this.register('boolean', BooleanSetting)
    this.register('bytes', ByteSetting)
    this.register('enum', EnumSetting)
    this.register('number', NumberSetting)
    this.register('text', TextSetting)
  }

  /**
   * Configure a Setting object based on the provided specification.
   * @example
   * let variantSetting = SettingFactory.getInstance().create({
   *   name: 'variant',
   *   type: 'enum',
   *   options: {...}
   * })
   * @param {Object} spec Specification
   * @param {string} spec.name Name to provide to the Setting.
   * @param {string} spec.type Setting Factory identifier of Setting to use.
   * @throws Throws an error if specification is malformed.
   * @throws Throws an error if Setting type has not been registered.
   * @return {Setting} Configured Setting object.
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
