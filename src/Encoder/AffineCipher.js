
import SimpleSubstitutionEncoder from './SimpleSubstitution'

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'

/**
 * Encoder Brick for Affine Cipher encoding and decoding.
 */
export default class AffineCipherEncoder extends SimpleSubstitutionEncoder {
  /**
   * Brick constructor
   */
  constructor () {
    super()

    // linear function
    // f(x) = ax + b

    this.registerSetting([
      {
        name: 'a',
        type: 'number',
        value: 5,
        validateValue: this._validateSlopeValue.bind(this),
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'b',
        type: 'number',
        value: 8,
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'alphabet',
        type: 'alphabet',
        value: defaultAlphabet
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        value: false
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        value: true
      }
    ])
  }

  /**
   * Validates slope (a) setting value.
   */
  _validateSlopeValue () {

  }
}
