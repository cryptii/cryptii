import Chain from '../Chain.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'case-transform',
  title: 'Case transform',
  category: 'Transform',
  type: 'encoder'
}

/**
 * Encoder brick for case transforms
 */
export default class CaseTransformEncoder extends Encoder {
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
    this.addSetting({
      name: 'case',
      type: 'enum',
      value: 'lower',
      elements: [
        'lower',
        'upper',
        'capitalize',
        'alternating',
        'inverse'
      ],
      labels: [
        'Lower case',
        'Upper case',
        'Capitalize',
        'Alternating case',
        'Inverse case'
      ],
      randomizable: false,
      style: 'radio'
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  performEncode (content) {
    switch (this.getSettingValue('case')) {
      case 'lower':
        return content.toLowerCase()

      case 'upper':
        return content.toUpperCase()

      case 'capitalize':
        return Chain.wrap(
          content.getString()
            .replace(/\w\S*/ug, word =>
              word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
        )

      case 'alternating':
        return Chain.wrap(
          content.getChars()
            .map((char, index) =>
              index % 2 === 0
                ? char.toLowerCase()
                : char.toUpperCase())
            .join('')
        )

      case 'inverse':
        return this._inverseCase(content)

      default:
        return content
    }
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    switch (this.getSettingValue('case')) {
      case 'inverse':
        return this._inverseCase(content)

      default:
        // Not all case transforms can be undone
        return content
    }
  }

  /**
   * Inverses the case of each character.
   * @param {Chain} content Content to be transformed
   * @return {Chain} Transformed content
   */
  _inverseCase (content) {
    return Chain.wrap(
      content.getChars()
        .map(char => {
          const lowerChar = char.toLowerCase()
          return char !== lowerChar ? lowerChar : char.toUpperCase()
        })
        .join('')
    )
  }
}
