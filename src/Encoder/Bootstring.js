
import Encoder from '../Encoder'
import InvalidInputError from '../Error/InvalidInput'
import MathUtil from '../MathUtil'

const meta = {
  name: 'bootstring',
  title: 'Bootstring',
  category: 'Encoding',
  type: 'encoder'
}

const minBase = 2

const integerOverflowMessage =
  'Integer overflow: Input needs wider integers to process'

/**
 * Encoder brick for Bootstring encoding and decoding following RFC 3492.
 */
export default class BootstringEncoder extends Encoder {
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
        name: 'basicRangeStart',
        label: 'Basic Start',
        type: 'number',
        value: 0,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          rotate: false,
          min: 0,
          max: 127 - minBase
        }
      },
      {
        name: 'basicRangeEnd',
        label: 'Basic End',
        type: 'number',
        value: 127,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          rotate: false,
          min: minBase,
          // Max Unicode code point value
          max: 0x10FFFF
        }
      },
      {
        name: 'digitMapping',
        type: 'alphabet',
        value: 'abcdefghijklmnopqrstuvwxyz0123456789',
        randomizable: false,
        validateValue: this.validateDigitMappingValue.bind(this)
      },
      {
        name: 'delimiter',
        type: 'text',
        value: '-',
        width: 6,
        randomizable: false,
        validateValue: this.validateDelimiterValue.bind(this),
        options: {
          minLength: 1,
          maxLength: 1
        }
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        value: false,
        width: 6,
        randomizable: false
      },
      {
        name: 'initialBias',
        type: 'number',
        value: 72,
        width: 6,
        randomizable: false,
        validateValue: this.validateInitialBiasValue.bind(this),
        options: {
          integer: true
        }
      },
      {
        name: 'initialN',
        type: 'number',
        value: 128,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          min: 0
        }
      },
      {
        name: 'tmin',
        type: 'number',
        value: 1,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          rotate: false,
          min: 0,
          max: 26
        }
      },
      {
        name: 'tmax',
        type: 'number',
        value: 26,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          rotate: false,
          min: 0,
          max: 35
        }
      },
      {
        name: 'skew',
        type: 'number',
        value: 38,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'damp',
        type: 'number',
        value: 700,
        width: 6,
        randomizable: false,
        options: {
          integer: true,
          min: 2
        }
      }
    ])
  }

  /**
   * Performs encode on given content following section 6.3 of RFC 3492.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    const {
      initialBias,
      initialN,
      tmin,
      tmax,
      caseSensitivity
    } = this.getSettingValues()

    const delimiter = this.getSettingValue('delimiter').getCodePointAt(0)
    const base = this.getSettingValue('digitMapping').getLength()

    // Prepare content
    if (!caseSensitivity) {
      content = content.toLowerCase()
    }

    // Initialize the state
    let n = initialN
    let bias = initialBias
    let delta = 0

    // Copy basic code points in the input to the output in order
    const input = content.getCodePoints()
    const inputLength = input.length
    const output = []
    const nonBasicInput = []
    let codePoint

    for (let i = 0; i < input.length; i++) {
      codePoint = input[i]
      if (this._isBasic(codePoint)) {
        output.push(codePoint)
      } else if (codePoint >= n) {
        nonBasicInput.push(codePoint)
      } else {
        throw new InvalidInputError(
          `Unexpected code point at index ${i}, consider changing initial n ` +
          `to include this code point`)
      }
    }

    // Sort non-basic input code points in ascending order
    nonBasicInput.sort()

    let h = output.length
    let b = output.length
    if (b > 0) {
      output.push(delimiter)
    }

    let m, q, k, t, j
    while (h < inputLength) {
      m = nonBasicInput.find(codePoint => codePoint >= n)

      // Overflow detection
      if (m - n > MathUtil.div(Number.MAX_SAFE_INTEGER - delta, h + 1)) {
        throw new InvalidInputError(integerOverflowMessage)
      }

      delta += (m - n) * (h + 1)
      n = m

      for (j = 0; j < inputLength; j++) {
        codePoint = input[j]
        if (codePoint < n || this._isBasic(codePoint)) {
          // Overflow detection
          if (++delta > Number.MAX_SAFE_INTEGER) {
            throw new InvalidInputError(integerOverflowMessage)
          }
        }
        if (codePoint === n) {
          q = delta
          for (k = base; true; k += base) {
            t = this._calcT(k, bias, tmin, tmax)
            if (q < t) {
              break
            }
            output.push(this._basicCodePointFromDigit(
              t + MathUtil.mod(q - t, base - t)))
            q = MathUtil.div(q - t, base - t)
          }
          output.push(this._basicCodePointFromDigit(q))
          bias = this._adaptBias(delta, h + 1, h === b)
          delta = 0
          h++
        }
      }

      delta++
      n++
    }

    return output
  }

  /**
   * Performs decode on given content following section 6.2 of RFC 3492.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    const {
      initialBias,
      initialN,
      tmin,
      tmax,
      caseSensitivity
    } = this.getSettingValues()

    const delimiter = this.getSettingValue('delimiter').getCodePointAt(0)
    const base = this.getSettingValue('digitMapping').getLength()

    // Prepare case insensitive content
    if (!caseSensitivity) {
      content = content.toLowerCase()
    }

    // Initialize the state
    let n = initialN
    let bias = initialBias

    // Consume all code points before the last delimiter (if there is one)
    // and copy them to output, fail on any non-basic code point
    const input = content.getCodePoints()
    const inputLength = input.length
    const basicLength = Math.max(input.lastIndexOf(delimiter), 0)
    const output = []

    for (let j = 0; j < basicLength; j++) {
      if (!this._isBasic(input[j])) {
        throw new InvalidInputError(
          `Found unexpected non-basic code point at ${j}`)
      }
      output.push(input[j])
    }

    let i = 0
    let j = basicLength > 0 ? basicLength + 1 : 0
    let oldi, w, k, digit, t

    while (j < inputLength) {
      oldi = i
      w = 1

      for (k = base; true; k += base) {
        // Fail if there is no code point to consume next
        if (j >= inputLength) {
          throw new InvalidInputError('The input ends unexpectedly')
        }

        digit = this._digitFromBasicCodePoint(input[j++])

        if (digit === -1) {
          throw new InvalidInputError(
            `Found unexpected non-basic code point at ${j - 1}`)
        }

        // Overflow detection
        if (digit > MathUtil.div(Number.MAX_SAFE_INTEGER - i, w)) {
          throw new InvalidInputError(integerOverflowMessage)
        }

        i += digit * w

        t = this._calcT(k, bias, tmin, tmax)
        if (digit < t) {
          break
        }

        // Overflow detection
        if (w > MathUtil.div(Number.MAX_SAFE_INTEGER, base - t)) {
          throw new InvalidInputError(integerOverflowMessage)
        }

        w *= base - t
      }

      bias = this._adaptBias(i - oldi, output.length + 1, oldi === 0)

      // Overflow detection
      if (MathUtil.div(i, output.length + 1) > Number.MAX_SAFE_INTEGER - n) {
        throw new InvalidInputError(integerOverflowMessage)
      }

      n += MathUtil.div(i, output.length + 1)
      i = MathUtil.mod(i, output.length + 1)

      // If n is a basic code point then fail
      if (this._isBasic(n)) {
        throw new InvalidInputError('Unexpectedly unwrapped basic code point')
      }

      output.splice(i, 0, n)
      i++
    }

    return output
  }

  /**
   * Bias adaptation function following section 6.1 of RFC 3492.
   * After each delta is encoded or decoded, bias is set for the next delta.
   * @param {number} delta
   * @param {number} numPoints
   * @param {boolean} firstTime
   * @return {number}
   */
  _adaptBias (delta, numPoints, firstTime) {
    const { digitMapping, tmin, tmax, skew } = this.getSettingValues()
    const base = digitMapping.getLength()

    if (firstTime) {
      const damp = this.getSettingValue('damp')
      delta = MathUtil.div(delta, damp)
    } else {
      delta = MathUtil.div(delta, 2)
    }

    delta += MathUtil.div(delta, numPoints)

    let k = 0
    while (delta > MathUtil.div((base - tmin) * tmax, 2)) {
      delta = MathUtil.div(delta, base - tmin)
      k += base
    }

    return k + MathUtil.div((base - tmin + 1) * delta, delta + skew)
  }

  /**
   * Chooses the next T value based on given parameters.
   * @param {number} k
   * @param {number} bias
   * @param {number} tmin
   * @param {number} tmax
   * @return {number}
   */
  _calcT (k, bias, tmin, tmax) {
    if (k <= bias + tmin) {
      return tmin
    } else if (k >= bias + tmax) {
      return tmax
    }
    return k - bias
  }

  /**
   * Checks wether the given code point is considered to be basic.
   * @param {number} codePoint Unicode code point
   * @return {boolean} True, if the given code point is basic
   */
  _isBasic (codePoint) {
    const { basicRangeStart, basicRangeEnd } = this.getSettingValues()
    return codePoint >= basicRangeStart && codePoint <= basicRangeEnd
  }

  /**
   * Translates a Unicode code point into a basic code point digit.
   * @param {number} codePoint Unicode code point
   * @return {number} Basic code point digit or -1, if there is no digit
   * assigned to the given Unicode code point
   */
  _digitFromBasicCodePoint (codePoint) {
    return this.getSettingValue('digitMapping').indexOfCodePoint(codePoint)
  }

  /**
   * Translates a basic code point digit into a Unicode code point.
   * @param {number} digit Basic code point digit
   * @return {number} Unicode code point
   */
  _basicCodePointFromDigit (digit) {
    return this.getSettingValue('digitMapping').getCodePointAt(digit)
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    super.settingValueDidChange(setting, value)
    switch (setting.getName()) {
      case 'basicRangeStart':
        this.getSetting('basicRangeEnd').setMin(setting.getValue() + minBase)
        this.getSetting('digitMapping').revalidateValue()
        this.getSetting('delimiter').revalidateValue()
        break
      case 'basicRangeEnd':
        this.getSetting('basicRangeStart').setMax(setting.getValue() - minBase)
        this.getSetting('digitMapping').revalidateValue()
        this.getSetting('delimiter').revalidateValue()
        break
      case 'digitMapping':
        this.getSetting('tmax').setMax(setting.getValue().getLength())
        break
      case 'tmax':
        this.getSetting('tmin').setMax(setting.getValue())
        break
    }
  }

  /**
   * Validates the digit mapping value.
   * @param {Chain} value Value to be validated
   * @param {Field} setting Sender field
   * @return {boolean|object}
   */
  validateDigitMappingValue (value, setting) {
    const basicRangeStart = this.getSetting('basicRangeStart')
    const basicRangeEnd = this.getSetting('basicRangeEnd')

    if (!basicRangeStart.isValid() || !basicRangeEnd.isValid()) {
      // Can't validate digit mapping without valid basic range
      return false
    }

    const rangeStart = basicRangeStart.getValue()
    const rangeEnd = basicRangeEnd.getValue()

    const invalidIndex = value.getCodePoints().findIndex(codePoint =>
      codePoint < rangeStart || codePoint > rangeEnd)

    if (invalidIndex !== -1) {
      return {
        key: 'bootstringDigitMappingInvalid',
        message:
          `Character at index ${invalidIndex} needs to be part of the given ` +
          `basic code point range`
      }
    }

    return true
  }

  /**
   * Validates the delimiter value.
   * @param {Chain} value Delimiter value
   * @param {Field} setting Sender field
   * @return {boolean|object}
   */
  validateDelimiterValue (value, setting) {
    const basicRangeStart = this.getSetting('basicRangeStart')
    const basicRangeEnd = this.getSetting('basicRangeEnd')
    const digitMapping = this.getSetting('digitMapping')

    if (!basicRangeStart.isValid() ||
        !basicRangeEnd.isValid() ||
        !digitMapping.isValid()) {
      // Can't validate digit mapping without valid basic range
      return false
    }

    const delimiter = value.getCodePointAt(0)

    // Delimiter needs to be in the basic code point range
    if (delimiter < basicRangeStart.getValue() ||
        delimiter > basicRangeEnd.getValue() ||
        digitMapping.getValue().indexOfCodePoint(delimiter) !== -1) {
      return {
        key: 'bootstringDelimiterInvalid',
        message:
          `The value must be part of the basic code point range while ` +
          `not having a digit mapped to it`
      }
    }

    return true
  }

  /**
   * Validates initial bias setting value according to section 4 of RFC 3492
   * such that `initial_bias mod base <= base - tmin`.
   * @param {number} value Initial bias to be validated
   * @param {Field} setting Sender field
   * @return {boolean|object}
   */
  validateInitialBiasValue (value, setting) {
    const digitMapping = this.getSetting('digitMapping')
    const tmin = this.getSetting('tmin')

    if (!digitMapping.isValid() || !tmin.isValid()) {
      // Can't validate initial bias without valid base and tmin values
      return false
    }

    const base = digitMapping.getValue().getLength()

    if (MathUtil.mod(value, base) > base - tmin) {
      return {
        key: 'bootstringInitialBiasInvalid',
        message:
          'The value must be chosen such that ' +
          'initial_bias mod base <= base - tmin'
      }
    }

    return true
  }
}
