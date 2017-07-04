
import TextEncoder from './TextEncoder'

/**
 * Container for storing String, Unicode code point and byte content.
 * When requested, it lazily translates between these representations.
 */
export default class Chain {
  /**
   * Chains can be constructed given either a string, an array of code points
   * or an Uint8Array of bytes.
   * @example
   * let a = new Chain('🦊🚀')
   * let b = new Chain([129418, 128640])
   * let c = new Chain(new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128]))
   * Chain.isEqual(a, b, c) // returns true
   * @param {?number[]|string|Uint8Array} [value=null] Chain content
   * @param {string} [encoding='utf8'] Byte encoding
   */
  constructor (value = null, encoding = 'utf8') {
    this._codePoints = null
    this._string = null
    this._bytes = null

    this._encoding = encoding

    let valueType = Object.prototype.toString.call(value)
    switch (valueType) {
      case '[object Null]':
        // initializes empty chain
        this._codePoints = []
        this._string = ''
        this._bytes = new Uint8Array(0)
        break
      case '[object Array]':
        // initializes chain with code points
        this._codePoints = value
        break
      case '[object String]':
        // initializes chain with a string
        this._string = value
        break
      case '[object Uint8Array]':
        // initializes chain with bytes
        this._bytes = value
        break
      default:
        throw new Error(
          `Chain constructor expects one optional parameter of type ` +
          `Array, String or Uint8Array. Received unexpected ${valueType}.`)
    }
  }

  /**
   * Lazily retrieves the Unicode code point representation.
   * @return {number[]} Array of Unicode code points
   */
  getCodePoints () {
    if (this._codePoints === null) {
      if (this._string !== null) {
        // retrieve code points from string
        this._codePoints = TextEncoder.codePointsFromString(this._string)
      } else {
        // retrieve code points from bytes
        this._codePoints = TextEncoder.codePointsFromBytes(
          this._bytes, this._encoding)
      }
    }
    return this._codePoints
  }

  /**
   * Returns a new array iterator that contains the Unicode code points for each
   * index. Makes Chains iterable (e.g. using the for...of statement).
   * @return {iterator}
   */
  [Symbol.iterator] () {
    return this.getCodePoints().values
  }

  /**
   * Returns Unicode code point at given index.
   * @param {number} index Unicode code point index
   * @return {number} Unicode code point
   */
  getCodePointAt (index) {
    let codePoints = this.getCodePoints()
    return codePoints[index]
  }

  /**
   * Returns string representation of Unicode character at given index.
   * @param {number} index Unicode code point index
   * @return {string} Character
   */
  getCharAt (index) {
    return TextEncoder.stringFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns amount of Unicode code points.
   * @return {number} Amount of Unicode code points
   */
  getLength () {
    return this.getCodePoints().length
  }

  /**
   * Lazily retrieves the string representation.
   * @return {string}
   */
  getString () {
    // lazily retrieve string
    if (this._string === null) {
      // retrieve string from code points
      this._string = TextEncoder.stringFromCodePoints(this.getCodePoints())
    }
    return this._string
  }

  /**
   * Alias of {@link Chain.getString}.
   * @return {string}
   */
  toString () {
    return this.getString()
  }

  /**
   * Returns a string describing the content of this Chain.
   * @return {string}
   */
  getDescription () {
    if (this._string !== null) {
      return `String(${this._string})`
    } else if (this._codePoints !== null) {
      return `CodePoints(${this._codePoints.join(', ')})`
    } else {
      let string = this._bytes.reduce((string, byte) => {
        return string + ('0' + byte.toString(16)).slice(-2)
      })
      return `Bytes(${string})`
    }
  }

  /**
   * Returns wether given value is contained.
   * @param {Chain|string} value Value to search for.
   * @return {boolean}
   */
  contains (value) {
    return this.toString().indexOf(value.toString()) !== -1
  }

  /**
   * Returns the first index at which a given element can be found
   * and -1 if not found.
   * @param {string|Chain} value Search element
   * @param {number} [start] Index to start the search at.
   * @return {number} Code point index; -1 if not found.
   */
  indexOf (value, start = undefined) {
    // find element in string representation
    let string = this.getString()
    let stringIndex = string.indexOf(value.toString(), start)

    if (stringIndex === -1) {
      // not found
      return -1
    } else {
      // translate string index into code point index
      let leftPartString = string.substr(0, stringIndex)
      let leftPartCodePoints = TextEncoder.codePointsFromString(leftPartString)
      return leftPartCodePoints.length
    }
  }

  /**
   * Lazily retrieves the byte representation.
   * @return {Uint8Array} Uint8Array of bytes.
   */
  getBytes () {
    // lazily retrieve bytes
    if (this._bytes === null) {
      // retrieve bytes from code points
      this._bytes = TextEncoder.bytesFromCodePoints(
        this.getCodePoints(), this._encoding)
    }
    return this._bytes
  }

  /**
   * Returns byte value at index.
   * @param {number} index Byte index
   * @return {number} Byte
   */
  getByteAt (index) {
    let bytes = this.getBytes()
    return bytes[index]
  }

  /**
   * Returns the amount of bytes.
   * @return {number} Amount of bytes
   */
  getSize () {
    return this.getBytes().length
  }

  /**
   * Returns true if Chain contains no string
   * characters, Unicode code points or bytes.
   * @return {boolean}
   */
  isEmpty () {
    return (
      (this._codePoints !== null && this._codePoints.length === 0) ||
      (this._string !== null && this._string === '') ||
      (this._bytes !== null && this._bytes.length === 0)
    )
  }

  /**
   * Returns true if this Chain's content is equal to given Chain's content.
   * @param {?Chain} chain Chain to compare to.
   * @return {boolean} True, if content is equal.
   */
  isEqualTo (chain) {
    // check instance class
    if (!(chain instanceof Chain)) {
      return false
    }
    // compare content
    return (
      (this._string !== null && this._string === chain._string) ||
      (this._codePoints !== null && JSON.stringify(this._codePoints) ===
        JSON.stringify(chain.getCodePoints())) ||
      (this._bytes !== null && JSON.stringify(this._bytes) ===
        JSON.stringify(chain.getBytes()))
    )
  }

  /**
   * Returns true if the content of given chains is equal.
   * Uses {@link Chain.isEqualTo} internally.
   * @param {?...Chain} chains Chains to compare.
   * @return {boolean} True, if content is equal.
   */
  static isEqual (...chains) {
    if (chains.length < 2) {
      return true
    }

    // retrieve first chain and verify instance
    let first = chains[0]
    if (!(first instanceof Chain)) {
      return false
    }

    // compare first chain to others
    let equal = true
    let i = 0
    while (equal && ++i < chains.length) {
      equal = first.isEqualTo(chains[i])
    }
    return equal
  }

  /**
   * Returns lower case representation of this Chain.
   * @return {Chain} Lower case Chain
   */
  toLowerCase () {
    return new Chain(this.getString().toLowerCase(), this._encoding)
  }

  /**
   * Returns upper case representation of this Chain.
   * @return {Chain} Upper case Chain
   */
  toUpperCase () {
    return new Chain(this.getString().toUpperCase(), this._encoding)
  }
}
