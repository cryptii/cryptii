import ArrayUtil from './ArrayUtil.js'
import ByteEncoder from './ByteEncoder.js'
import TextEncoder from './TextEncoder.js'
import TextEncodingError from './Error/TextEncoding.js'

// empty chain instance instantiated lazily by static Chain.empty method
let emptyChain = null

/**
 * Container for storing strings, Unicode code points and bytes.
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

    if (value === null) {
      // Initializes empty chain
      this._codePoints = []
      this._string = ''
      this._bytes = new Uint8Array(0)
    } else {
      // Initialize depending on value type
      const valueType = Object.prototype.toString.call(value)
      switch (valueType) {
        case '[object Array]':
          // Validate array of code points
          if (!TextEncoder.validateCodePoints(value)) {
            throw new Error(
              'Chain constructor expects a valid array of code points.')
          }
          // Initializes chain with code points
          this._codePoints = value
          break
        case '[object String]':
          // Initializes chain with a string
          this._string = value
          break
        case '[object Uint8Array]':
          // Initializes chain with bytes
          this._bytes = value
          break
        default:
          throw new Error(
            'Chain constructor expects one optional parameter of type ' +
            `Array, String or Uint8Array. Received unexpected ${valueType}.`)
      }
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
   * Returns a string for each Unicode character.
   * @return {string[]}
   */
  getChars () {
    return this.getCodePoints().map(codePoint =>
      TextEncoder.stringFromCodePoints([codePoint]))
  }

  /**
   * Returns a new array iterator that contains the Unicode code points for each
   * index. Makes chains iterable (e.g. using the for...of statement).
   * @return {iterator}
   */
  [Symbol.iterator] () {
    return this.getCodePoints().values
  }

  /**
   * Returns a Unicode code point at given index.
   * @param {number} index Unicode code point index
   * @return {number} Unicode code point
   */
  getCodePointAt (index) {
    return this.getCodePoints()[index]
  }

  /**
   * Returns the string representation of Unicode character at given index.
   * @param {number} index Unicode code point index
   * @return {string} Character string
   */
  getCharAt (index) {
    return TextEncoder.stringFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns the byte representation of a Unicode character at given index.
   * @param {number} index Unicode code point index
   * @return {Uint8Array} Character bytes
   */
  getCharBytesAt (index) {
    return TextEncoder.bytesFromCodePoints([this.getCodePointAt(index)])
  }

  /**
   * Returns the amount of Unicode code points inside chain.
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
    if (this._string === null) {
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
   * Returns lower case representation of this chain.
   * @return {Chain} Lower case chain
   */
  toLowerCase () {
    return Chain.wrap(this.getString().toLowerCase(), this._encoding)
  }

  /**
   * Returns upper case representation of this chain.
   * @return {Chain} Upper case chain
   */
  toUpperCase () {
    return Chain.wrap(this.getString().toUpperCase(), this._encoding)
  }

  /**
   * Splits a chain into an array of chains by separating it, using the
   * specified separator string or chain to determine where to make each split.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
   * @param {string|Chain} [separator]
   * @param {number} [limit]
   * @return {Chain[]}
   */
  split (separator = undefined, limit = undefined) {
    separator = separator instanceof Chain ? separator.toString() : separator
    return this.getString()
      .split(separator, limit)
      .map(stringPart => Chain.wrap(stringPart, this._encoding))
  }

  /**
   * Returns the characters in a string beginning at the specified location
   * through the specified number of characters.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
   * @param {number} start
   * @param {number} [length]
   * @return {Chain}
   */
  substr (start, length = undefined) {
    if (length <= 0 || start >= this.getLength()) {
      return Chain.empty()
    } else if (start < 0) {
      start = Math.max(this.getLength() + start, 0)
    }

    const codePoints = this.getCodePoints()
      .slice(start, length ? start + length : undefined)
    return Chain.wrap(codePoints, this._encoding)
  }

  /**
   * Truncates chain to given length and adds ellipsis if truncated.
   * @param {number} length Length the string should be truncated to
   * @return {Chain} Truncated or original chain depending on length
   */
  truncate (length) {
    return this.getLength() > length
      ? Chain.wrap(this.substr(0, length).getString() + '…', this._encoding)
      : this
  }

  /**
   * Creates a mixed alphabet by extending this chain by the given one.
   * @param {number[]|string|Uint8Array|Chain} alphabet Alphabet the target
   * should be extended by.
   * @return {Chain} Mixed alphabet
   */
  extend (alphabet) {
    const key = this.getCodePoints()
    const codePoints = Chain.wrap(alphabet).getCodePoints()
    const mixedAlphabet = key.slice()
    let element
    let i = 0
    while (mixedAlphabet.length < codePoints.length && i < codePoints.length) {
      element = codePoints[i++]
      if (key.indexOf(element) === -1) {
        mixedAlphabet.push(element)
      }
    }
    return Chain.wrap(mixedAlphabet)
  }

  /**
   * Retrieves the matches when matching a string against a regular expression.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
   * @param {RegExp|string} regexp A regular expression object.
   * @return {?array}
   */
  match (regexp) {
    return this.getString().match(regexp)
  }

  /**
   * Returns a string describing the content of this chain.
   * Useful for logging, debugging.
   * @return {string}
   */
  getDescription () {
    if (this._string !== null) {
      return `String(${this._string})`
    } else if (this._codePoints !== null) {
      return `CodePoints(${this._codePoints.join(', ')})`
    } else {
      return `Bytes(${ByteEncoder.hexStringFromBytes(this._bytes)})`
    }
  }

  /**
   * Returns wether given text is contained in this chain.
   * @param {Chain|string} needle String or Chain to search for
   * @return {boolean}
   */
  contains (needle) {
    return this.getString().indexOf(needle.toString()) !== -1
  }

  /**
   * Returns the first index at which a given code point can be found
   * and -1 if not found.
   * @param {number} codePoint Unicode code point to search for
   * @param {number} [start] Index to start the search at
   * @return {number} Code point index; -1 if not found
   */
  indexOfCodePoint (codePoint, start = undefined) {
    return this.getCodePoints().indexOf(codePoint, start)
  }

  /**
   * Returns the first index at which a given string can be found
   * and -1 if not found.
   * @param {string|Chain} value Search element
   * @param {number} [start] Index to start the search at
   * @return {number} Code point index; -1 if not found
   */
  indexOf (value, start = undefined) {
    const string = this.getString()
    const stringIndex = string.indexOf(value.toString(), start)

    if (stringIndex === -1) {
      return -1
    } else {
      // translate string index into code point index
      const leftPart = string.substr(0, stringIndex)
      const leftPartCodePoints = TextEncoder.codePointsFromString(leftPart)
      return leftPartCodePoints.length
    }
  }

  /**
   * Lazily retrieves the byte representation.
   * @return {Uint8Array} Uint8Array of bytes
   */
  getBytes () {
    if (this._bytes === null) {
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
    return this.getBytes()[index]
  }

  /**
   * Returns the amount of bytes.
   * @return {number} Amount of bytes
   */
  getSize () {
    return this.getBytes().length
  }

  /**
   * Returns true, if text encoding is needed before returning the string or
   * code point representation. Translation between text and bytes may throw an
   * error if encountering malformed content.
   * @return {boolean}
   */
  needsTextEncoding () {
    return this._codePoints === null && this._string === null
  }

  /**
   * Returns true, if byte encoding is needed before returning the byte
   * representation. Translation between text and bytes may throw an error
   * if encountering malformed content.
   * @return {boolean}
   */
  needsByteEncoding () {
    return this._bytes === null
  }

  /**
   * Returns true if chain contains an empty string, zero Unicode
   * characters or zero bytes.
   * @return {boolean}
   */
  isEmpty () {
    return (
      this === emptyChain ||
      (this._codePoints !== null && this._codePoints.length === 0) ||
      (this._string !== null && this._string === '') ||
      (this._bytes !== null && this._bytes.length === 0)
    )
  }

  /**
   * Returns true if this chain's content is equal to given chain's content.
   * Only encodes or decodes between text and bytes if necessary.
   * @param {?Chain} chain Chain to compare to
   * @return {boolean} True, if content is equal
   */
  isEqualTo (chain) {
    // check pointer
    if (chain === this) {
      return true
    }

    // check instance class
    if (!(chain instanceof Chain)) {
      return false
    }

    // check if empty
    if (this.isEmpty() && chain.isEmpty()) {
      return true
    }

    // check encoding
    if (chain.getEncoding() !== this._encoding) {
      return false
    }

    // compare string instance (fast)
    if (this._string !== null && this._string === chain._string) {
      return true
    }

    // check if both chains use byte representation
    if (this._bytes !== null && chain._bytes !== null) {
      return ArrayUtil.isEqual(this._bytes, chain._bytes)
    }

    try {
      // compare code points of chains
      // translation between text and bytes may throw a text encoding error
      return ArrayUtil.isEqual(this.getCodePoints(), chain.getCodePoints())
    } catch (error) {
      if (error instanceof TextEncodingError) {
        // translation to the *lowest common denominator* failed
        // chains are not comparable, consider them not equal
        return false
      } else {
        throw error
      }
    }
  }

  /**
   * Returns byte encoding this chain has been created with.
   * @return {string} Byte encoding
   */
  getEncoding () {
    return this._encoding
  }

  /**
   * Returns true if the content of given chains is equal.
   * Uses {@link Chain.isEqualTo} internally.
   * @param {?...Chain} chains Chains to compare
   * @return {boolean} True, if content is equal
   */
  static isEqual (...chains) {
    if (chains.length < 2) {
      return true
    }

    // retrieve first chain and verify instance
    const first = chains[0]
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
   * Wraps value inside a chain object if it is not already a chain.
   * @param {?number[]|string|Uint8Array|Chain} value
   * @param {string} [encoding='utf8'] Byte encoding
   * @return {Chain}
   */
  static wrap (value, encoding = 'utf8') {
    if (value instanceof Chain) {
      // nothing to do, value already is a chain object
      return value
    }
    if (value === null || value.length === 0) {
      // use empty chain constant when possible
      return Chain.empty()
    }
    // create new chain object
    return new Chain(value, encoding)
  }

  /**
   * Joins all elements of an array (or an array-like object) into a chain.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
   * @param {array} elements
   * @param {string|Chain} [separator]
   * @return {Chain}
   */
  static join (elements, separator = undefined) {
    return Chain.wrap(
      elements
        .map(element => element.toString())
        .join(separator))
  }

  /**
   * Returns the empty chain constant.
   * @return {Chain} Empty Chain
   */
  static empty () {
    if (emptyChain === null) {
      emptyChain = new Chain()
    }
    return emptyChain
  }
}
