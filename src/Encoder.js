
import Brick from './Brick'

/**
 * Abstract Brick for encoding and decoding content.
 * @abstract
 */
export default class Encoder extends Brick {
  /**
   * Performs encode on given content.
   * @abstract
   * @param {Chain} content
   * @return {Chain|Promise}
   */
  encode (content) {
    // abstract method
  }

  /**
   * Performs decode on given content.
   * @abstract
   * @param {Chain} content
   * @return {Chain|Promise}
   */
  decode (content) {
    // abstract method
  }

  /**
   * Triggered when a setting value has changed.
   * Override is required to call super.
   * @protected
   * @param {Setting} setting
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting) {
    // notify delegate
    this.hasPipe() && this.getPipe().encoderSettingDidChange(this)
    return this
  }
}
