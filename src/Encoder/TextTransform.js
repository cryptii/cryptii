
import Chain from '../Chain'
import Encoder from '../Encoder'

const meta = {
  name: 'text-transform',
  title: 'Text transform',
  category: 'Transform',
  type: 'encoder'
}

/**
 * Encoder brick for text transformations
 */
export default class TextTransformEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Brick constructor
   */
  constructor () {
    super()

    this.registerSetting([
      {
        name: 'case',
        type: 'enum',
        label: 'Case',
        value: 'none',
        randomizable: false,
        style: 'radio',
        options: {
          elements: [
            'none',
            'lower',
            'upper',
            'capitalize',
            'alternating',
            'inverse'
          ],
          labels: [
            'None',
            'Lower case',
            'Upper case',
            'Capitalize',
            'Alternating case',
            'Inverse case'
          ]
        }
      },
      {
        name: 'arrangement',
        type: 'enum',
        label: 'Arrangement',
        value: 'none',
        randomizable: false,
        options: {
          elements: [
            'none',
            'reverse'
          ],
          labels: [
            'None',
            'Reverse'
          ]
        }
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain} Encoded content
   */
  performEncode (content) {
    // transform case
    const caseTransform = this.getSettingValue('case')
    content = this._encodeCase(content, caseTransform)

    // transform arrangement
    const arrangementTransform = this.getSettingValue('arrangement')
    content = this._encodeArrangement(content, arrangementTransform)

    return content
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {Chain} Decoded content
   */
  performDecode (content) {
    // transform arrangement
    const arrangementTransform = this.getSettingValue('arrangement')
    content = this._decodeArrangement(content, arrangementTransform)

    // transform case
    const caseTransform = this.getSettingValue('case')
    if (caseTransform === 'inverse') {
      content = this._decodeCase(content, caseTransform)
    }

    return content
  }

  /**
   * Transforms letter case.
   * @param {Chain} content
   * @param {string} transform
   * @return {Chain}
   */
  _encodeCase (content, transform) {
    switch (transform) {
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
        return Chain.wrap(
          content.getChars()
            .map(char => {
              let lowerChar = char.toLowerCase()
              return char !== lowerChar ? lowerChar : char.toUpperCase()
            })
            .join('')
        )
    }
    return content
  }

  /**
   * Transforms letter case back.
   * @param {Chain} content
   * @param {string} transform
   * @return {Chain}
   */
  _decodeCase (content, transform) {
    // not all case transformations can be undone
    switch (transform) {
      case 'inverse':
        return this._encodeCase(content, transform)
    }
    return content
  }

  /**
   * Transforms letter arrangement.
   * @param {Chain} content
   * @param {string} transform
   * @return {Chain}
   */
  _encodeArrangement (content, transform) {
    switch (transform) {
      case 'reverse':
        return new Chain(content.getCodePoints().slice(0).reverse())
    }
    return content
  }

  /**
   * Transforms letter arrangement back.
   * @param {Chain} content
   * @param {string} transform
   * @return {Chain}
   */
  _decodeArrangement (content, transform) {
    switch (transform) {
      case 'reverse':
        return this._encodeArrangement(content, transform)
    }
    return content
  }
}
