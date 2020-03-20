
import Chain from './Chain'
import MarkedChainView from '../views/MarkedChain'
import UnicodeEncoder from './Encoder/UnicodeEncoder'
import Viewable from './Viewable'

/**
 * Chain marked with tokens.
 */
export default class MarkedChain extends Viewable {
  /**
   * React component this model is represented by
   */
  protected viewComponent = MarkedChainView

  /**
   * Chain instance
   */
  private chain: Chain

  /**
   * Mark Unicode code point start indices
   */
  private starts: number[] = []

  /**
   * Mark Unicode code point end indices
   */
  private ends: number[] = []

  /**
   * Token for each range
   */
  private tokens: string[] = []

  /**
   * Constructor
   * @param chain - Chain instance to highlight
   */
  constructor (chain: Chain) {
    super()
    this.chain = chain
  }

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    const [parts, tokens] = this.composeMarks()
    return {
      parts,
      tokens
    }
  }

  /**
   * Marks the given range.
   * @param start - Unicode code point start index
   * @param end - Unicode code point end index
   * @param token - Highlight token
   */
  mark (start: number, end: number, token: string) {
    this.starts.push(start)
    this.ends.push(end)
    this.tokens.push(token)
  }

  /**
   * Breaks the Chain text into marked parts with tokens each.
   */
  composeMarks (): [string[], string[]] {
    // Collect Unicode code point indices at which highlights start or end
    const breakIndicies: number[] = [this.chain.getLength()]
    for (let i = 0; i < this.starts.length; i++) {
      if (breakIndicies.indexOf(this.starts[i]) === -1) {
        breakIndicies.push(this.starts[i])
      }
      if (breakIndicies.indexOf(this.ends[i]) === -1) {
        breakIndicies.push(this.ends[i])
      }
    }

    // Sort indices in ascending order
    breakIndicies.sort((a, b) => a - b)

    // Efficiently break down the text into marked parts
    const codePoints = this.chain.getCodePoints()
    const tokens = new Array(breakIndicies.length)
    const parts = new Array(breakIndicies.length)
    let j = -1
    let startIndex = 0
    let endIndex, sliceCodePoints, sliceString, sliceTokens, sliceTokensString

    for (let i = 0; i < breakIndicies.length; i++) {
      endIndex = breakIndicies[i]
      sliceCodePoints = codePoints.slice(startIndex, endIndex)
      sliceString = UnicodeEncoder.stringFromCodePoints(sliceCodePoints)

      // Collect tokens that match this part
      sliceTokens = []
      for (let k = 0; k < this.starts.length; k++) {
        if (this.starts[k] <= startIndex && this.ends[k] >= endIndex) {
          sliceTokens.push(this.tokens[k])
        }
      }

      // Sort and compare tokens with previous part's tokens
      sliceTokens.sort()
      sliceTokensString = sliceTokens.join(' ')
      if (j > -1 && tokens[j] === sliceTokensString) {
        // Tokens are shared with previous part, reuse it
        parts[j] += sliceString
      } else {
        // Create new highlight part
        j++
        parts[j] = sliceString
        tokens[j] = sliceTokensString
      }

      startIndex = endIndex
    }

    // Slice part
    return [parts.slice(0, j + 1), tokens.slice(0, j + 1)]
  }
}
