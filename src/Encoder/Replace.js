import ArrayUtil from '../ArrayUtil.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'replace',
  title: 'Replace',
  category: 'Transform',
  type: 'encoder'
}

/**
 * Encoder brick for find and replace
 */
export default class ReplaceEncoder extends Encoder {
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
        name: 'find',
        type: 'text',
        value: '',
        randomizable: false
      },
      {
        name: 'replace',
        type: 'text',
        value: '',
        randomizable: false
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        value: false,
        randomizable: false
      }
    ])
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content, isEncode) {
    const caseSensitivity = this.getSettingValue('caseSensitivity')

    // Swap find and replace values if decoding
    let { find, replace } = this.getSettingValues()
    if (!isEncode) {
      ;[find, replace] = [replace, find]
    }

    // Lowercase search and find text if searching case insensitive
    let search = content
    if (!caseSensitivity) {
      search = search.toLowerCase()
      find = find.toLowerCase()
    }

    // Proceed with code point array replacement
    search = search.getCodePoints()
    content = content.getCodePoints()
    find = find.getCodePoints()
    replace = replace.getCodePoints()

    // Find each occurrence of the `find` value in the search array
    // This algorithm is similar to `ArrayUtil.replaceSlice` with the
    // difference of having separate search and content arrays
    let i = 0
    let j = -1
    let result = []

    while ((j = ArrayUtil.indexOfSlice(search, find, j + 1)) !== -1) {
      // Stich together the content up to the reference and append
      // the `replace` value
      result = result.concat(content.slice(i, j))
      result = result.concat(replace)
      // Move the cursor behind the last found occurrence
      i = j + find.length
    }

    // Append string tail and return the resulting code points
    return result.concat(content.slice(i))
  }
}
