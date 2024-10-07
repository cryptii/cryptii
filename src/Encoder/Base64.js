import ByteEncoder from '../ByteEncoder.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'base64',
  title: 'Base64',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * The default Base64 base alphabet
 * @type {string}
 */
const defaultAlphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/**
 * Array of Base64 variant options extending the default options.
 * @type {object[]}
 */
const variants = [
  {
    name: 'base64',
    label: 'Base64 (RFC 3548, RFC 4648)',
    description: null,
    alphabet: `${defaultAlphabet}+/`
  },
  {
    name: 'base64url',
    label: 'Base64url (RFC 4648 §5)',
    description: 'URL and Filename Safe Alphabet',
    alphabet: `${defaultAlphabet}-_`,
    paddingOptional: true
  },
  {
    name: 'rfc2045',
    label: 'Transfer encoding for MIME (RFC 2045)',
    description: null,
    alphabet: `${defaultAlphabet}+/`,
    foreignCharacters: true,
    maxLineLength: 76
  },
  {
    name: 'rfc1421',
    label: 'Original Base64 (RFC 1421)',
    description: 'Privacy-Enhanced Mail (PEM)',
    alphabet: `${defaultAlphabet}+/`,
    maxLineLength: 64
  },
  {
    name: 'custom',
    label: 'Custom'
  }
]

/**
 * Encoder brick for base64 encoding and decoding
 */
export default class Base64Encoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSettings([
      {
        name: 'variant',
        type: 'enum',
        value: variants[0].name,
        elements: variants.map(variant => variant.name),
        labels: variants.map(variant => variant.label),
        descriptions: variants.map(variant => variant.description),
        randomizable: false
      },
      {
        name: 'alphabet',
        type: 'text',
        value: variants[0].alphabet,
        uniqueChars: true,
        minLength: 64,
        maxLength: 64,
        caseSensitivity: true,
        visible: false
      },
      {
        name: 'padding',
        type: 'text',
        value: '=',
        blacklistChars: variants[0].alphabet,
        minLength: 1,
        maxLength: 1,
        randomizable: false,
        visible: false,
        width: 6
      },
      {
        name: 'paddingOptional',
        type: 'boolean',
        value: false,
        randomizable: false,
        visible: false,
        width: 6
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  performEncode (content) {
    // Forward request to the internal byte encoder
    return ByteEncoder.base64StringFromBytes(
      content.getBytes(),
      this.getVariantOptions())
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    // Forward request to the internal byte encoder
    return ByteEncoder.bytesFromBase64String(
      content.getString(),
      this.getVariantOptions())
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'variant': {
        // Make alphabet and padding settings available with the custom variant
        this.getSetting('alphabet').setVisible(value === 'custom')
        this.getSetting('padding').setVisible(value === 'custom')
        this.getSetting('paddingOptional').setVisible(value === 'custom')
        break
      }

      case 'alphabet': {
        // Alphabet characters are not allowed to be used as padding
        this.getSetting('padding').setBlacklistChars(value)
        break
      }
    }
  }

  /**
   * Returns the current variant options.
   * @return {object} Variant options
   */
  getVariantOptions () {
    const name = this.getSettingValue('variant')
    if (name === 'custom') {
      // Compose custom options
      return {
        alphabet: this.getSettingValue('alphabet').getString(),
        padding: this.getSettingValue('padding').getCharAt(0),
        paddingOptional: this.getSettingValue('paddingOptional')
      }
    }

    // Find variant options
    return variants.find(variant => variant.name === name)
  }
}
