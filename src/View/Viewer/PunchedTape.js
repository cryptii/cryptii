
import ViewerView from '../Viewer'
import View from '../../View'

/**
 * Punched tape viewer view
 */
export default class PunchedTapeViewerView extends ViewerView {
  /**
   * Constructor
   */
  constructor () {
    super()

    this._tape = []
    this._rows = 8

    this._$canvas = null
    this._$holes = null
    this._$tapes = null
  }

  /**
   * Updates the tape.
   * @param {number[]} tape Tape content
   * @param {number} rows Tape rows
   * @return {PunchedTapeViewerView} Fluent interface
   */
  setTape (tape, rows) {
    this._tape = tape
    this._rows = rows
    return this.renderTape()
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('viewer-paper-tape')
    return $root
  }

  /**
   * Renders content.
   * @protected
   * @return {PunchedTapeViewerView} Fluent interface
   */
  renderContent () {
    // Tapes
    this._$tapes = document.createElementNS(
      'http://www.w3.org/2000/svg', 'path')
    this._$tapes.classList.add('viewer-punched-tape__tape')

    // Holes
    this._$holes = document.createElementNS(
      'http://www.w3.org/2000/svg', 'path')
    this._$holes.classList.add('viewer-punched-tape__hole')

    // SVG
    this._$canvas = document.createElementNS(
      'http://www.w3.org/2000/svg', 'svg')
    this._$canvas.classList.add('viewer-punched-tape__canvas')
    this._$canvas.appendChild(this._$tapes)
    this._$canvas.appendChild(this._$holes)

    // Initial tape render
    this.renderTape()

    // Compose content element
    const $content = super.renderContent()
    $content.appendChild(this._$canvas)
    return $content
  }

  /**
   * Layouts view and its subviews.
   * @return {View}
   */
  layout () {
    this.renderTape()
    return super.layout()
  }

  /**
   * Renders the given tape to the canvas
   * @return {PunchedTapeViewerView} Fluent interface
   */
  renderTape () {
    const tape = this._tape
    const length = this._tape.length
    const rows = this._rows

    // Measure canvas width
    const width = this._$canvas.getBoundingClientRect().width

    // Layout
    const lineSpacing = 12
    const outerOffset = 16
    const tapeOffset = 11
    const holeSize = 6
    const gridSize = 13
    const r = holeSize * 0.5

    const tapeWidth = width - outerOffset * 2
    const charCols = Math.floor((tapeWidth - tapeOffset * 2) / gridSize) + 1
    const tapeOffsetHr = (tapeWidth - (charCols - 1) * gridSize) / 2

    const tapeLines = Math.ceil(length / charCols)
    const charHeight = gridSize * (rows - 1) + tapeOffset * 2
    const lineHeight = charHeight + lineSpacing
    const height = tapeLines * (charHeight + outerOffset) + outerOffset

    // Render punched holes
    const holesPath = []
    let char, charX, charY, i, j

    for (i = 0; i < length; i++) {
      char = tape[i]

      // Layout tape char
      charX = outerOffset + tapeOffsetHr + (i % charCols) * gridSize
      charY = outerOffset + tapeOffset + Math.floor(i / charCols) * lineHeight

      for (j = rows - 1; j >= 0; j--) {
        if ((char & 1) !== 0) {
          // Render punched hole
          holesPath.push(`M ${charX - r} ${charY + j * gridSize}`)
          holesPath.push(`a ${r},${r} 0 1,0 ${holeSize},0`)
          holesPath.push(`a ${r},${r} 0 1,0 ${-holeSize},0`)
        }
        char = char >> 1
      }
    }

    // Render tape line rects
    const tapesPath = []

    for (y = 0; y < tapeLines; y++) {
      // Layout tape
      const tapeX = outerOffset
      const tapeY = outerOffset + y * lineHeight
      const tapeLineWidth = y < tapeLines - 1 || length % charCols === 0
        ? tapeWidth
        : (length % charCols) * gridSize + 2 * tapeOffsetHr

      // Render rounded tape shape
      tapesPath.push(`M ${tapeX},${tapeY + r}`)
      tapesPath.push(`a ${r},${r} 0 0 1 ${r},${-r}`)
      tapesPath.push(`L ${tapeX + tapeLineWidth - r},${tapeY}`)
      tapesPath.push(`a ${r},${r} 0 0 1 ${r},${r}`)
      tapesPath.push(`L ${tapeX + tapeLineWidth},${tapeY + charHeight - r}`)
      tapesPath.push(`a ${r},${r} 0 0 1 ${-r},${r}`)
      tapesPath.push(`L ${tapeX + r},${tapeY + charHeight}`)
      tapesPath.push(`a ${r},${r} 0 0 1 ${-r},${-r}`)
      tapesPath.push('Z')
    }

    // Apply changes to the DOM
    this._$canvas.style.height = `${height}px`
    this._$holes.setAttribute('d', holesPath.join(' '))
    this._$tapes.setAttribute('d', tapesPath.join(' '))
  }
}
