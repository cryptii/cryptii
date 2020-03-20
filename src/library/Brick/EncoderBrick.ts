
import Brick from './Brick'
import Chain from '../Chain'
import EventManager from '../EventManager'
import Field from '../Field/Field'
import InvalidInputError from '../Error/InvalidInputError'
import MathUtil from '../Util/MathUtil'

export interface TranslationMeta {
  /**
   * True for encode, false for decode
   */
  isEncode: boolean

  /**
   * Translation duration
   */
  duration: number

  /**
   * Number of bytes translated
   */
  byteCount?: number

  /**
   * Number of characters translated
   */
  charCount?: number
}

/**
 * Abstract Brick for encoding and decoding content.
 * @abstract
 */
export default class EncoderBrick extends Brick {
  /**
   * Meta data of the last translation
   */
  lastTranslationMeta?: TranslationMeta

  /**
   * Last translation's error
   */
  lastTranslationError?: Error

  /**
   * Brick reverse state
   */
  private reverse: boolean = false

  /**
   * Encodes the given content asynchronously.
   * @param content - Content to be encoded
   * @returns Encoded content
   */
  async encode (content: number[]|string|Uint8Array|Chain): Promise<Chain> {
    return this.translate(content, true)
  }

  /**
   * Decodes the given content asynchronously.
   * @param content - Content to be decoded
   * @returns Resolves to decoded content
   */
  async decode (content: number[]|string|Uint8Array|Chain): Promise<Chain> {
    return this.translate(content, false)
  }

  /**
   * Prepares and performs translation on given content.
   * @param content - Content to be translated
   * @param isEncode - True for encode, false for decode
   * @returns Resolves to translation result
   */
  async translate (
    content: number[]|string|Uint8Array|Chain,
    isEncode: boolean
  ): Promise<Chain> {
    try {
      // Track translation start time
      const startTime = MathUtil.time()

      // Check if translation direction is allowed
      if (isEncode === this.reverse && this.isEncodeOnly()) {
        throw new InvalidInputError('Brick is restricted to encoding only')
      }

      // Check for invalid settings
      const invalidFields = this.getSettingsForm().getInvalidFields()
      if (invalidFields.length > 0) {
        throw new InvalidInputError(
          `Can't ${isEncode ? 'encode' : 'decode'} with invalid settings: ` +
          invalidFields.map((setting: Field) => {
            const validationResult = setting.getValidationResult()
            return `${setting.getLabel()} (${validationResult!.message || 'none'})`
          }).join(', '))
      }

      // Wrap content in Chain object
      content = Chain.from(content)

      // Perform translation
      if (isEncode !== this.reverse) {
        content = Chain.from(await this.performEncode(content))
      } else {
        content = Chain.from(await this.performDecode(content))
      }

      // Track successful translation
      this.lastTranslationError = undefined
      this.lastTranslationMeta = {
        isEncode,
        duration: MathUtil.time() - startTime,
        byteCount: !content.isTextEncoded() ? content.getSize() : undefined,
        charCount: content.isTextEncoded() ? content.getLength() : undefined
      }
      this.updateView()
      return content

    } catch (error) {
      // Track failed translation
      this.lastTranslationError = error
      this.lastTranslationMeta = undefined
      this.updateView()
      throw error
    }
  }

  /**
   * Wether this encoder brick is restricted to the encode step (e.g. hash
   * functions).
   */
  isEncodeOnly (): boolean {
    return false
  }

  /**
   * Returns the reverse state of this encoder brick.
   */
  isReverse (): boolean {
    return this.reverse
  }

  /**
   * Sets the reverse state of this encoder brick.
   * @param reverse - Reverse state
   */
  setReverse (reverse: boolean): void {
    if (this.reverse !== reverse) {
      this.reverse = reverse
      this.updateView()
      if (this.getPipe()) {
        this.getPipe().encoderDidReverse(this, reverse)
      }
    }
  }

  /**
   * Serializes brick to a JSON serializable value.
   * @returns Serialized data
   */
  serialize (): any {
    const object = super.serialize()
    if (this.reverse) {
      object.reverse = true
    }
    return object
  }

  /**
   * Applies configuration from serialized brick data.
   * @param data - Serialized data
   * @throws {Error} If serialized data is invalid
   */
  extract (data: any): void {
    super.extract(data)
    if (data.reverse !== undefined) {
      if (typeof data.reverse !== 'boolean') {
        throw new Error(
          `Optional encoder property 'reverse' is expected to be of type 'boolean'`)
      }
      this.reverse = data.reverse
    }
  }

  /**
   * Performs encode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @param content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  protected performEncode (content: Chain) {
    return this.performTranslate(content, true)
  }

  /**
   * Performs decode on given content.
   * Calls {@link Encoder.performTranslate} by default.
   * @param content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  protected performDecode (content: Chain) {
    return this.performTranslate(content, false)
  }

  /**
   * Performs encode or decode on given content.
   * @param content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  protected performTranslate (content: Chain, isEncode: boolean) {
    return content
  }
}
