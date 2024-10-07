import ViewerView from '../Viewer.js'

// Tape layout variables
const lineSpacing = 16
const outerOffset = 16
const tapeOffset = 11
const markOffset = 8
const holeSize = 6
const sprocketSize = 3
const gridSize = 13

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
    this._$tapes = null
    this._$marks = null
    this._$holes = null
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
    return this.setNeedsUpdate()
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

    // Marks
    this._$marks = document.createElementNS(
      'http://www.w3.org/2000/svg', 'path')
    this._$marks.classList.add('viewer-punched-tape__mark')

    // Holes
    this._$holes = document.createElementNS(
      'http://www.w3.org/2000/svg', 'path')
    this._$holes.classList.add('viewer-punched-tape__hole')

    // SVG
    this._$canvas = document.createElementNS(
      'http://www.w3.org/2000/svg', 'svg')
    this._$canvas.classList.add('viewer-punched-tape__canvas')
    this._$canvas.appendChild(this._$tapes)
    this._$canvas.appendChild(this._$marks)
    this._$canvas.appendChild(this._$holes)

    // Initial tape render
    this.setNeedsUpdate()

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
    this.setNeedsUpdate()
    return super.layout()
  }

  /**
   * Updates view on model change.
   * @return {View} Fluent interface
   */
  update () {
    const tape = this._tape
    const length = this._tape.length
    let rows = this._rows

    // Configure the sprocket holes and add a row for them
    // The bits on the narrower side of the tape are generally
    // the least significant bits
    const sprocketIndex = Math.floor((rows - 1) / 2)
    rows++

    // Measure canvas width
    const width = this._$canvas.getBoundingClientRect().width

    // Layout
    const r = holeSize * 0.5
    const s = sprocketSize * 0.5

    const tapeWidth = width - outerOffset * 2
    const charCols = Math.floor((tapeWidth - tapeOffset * 2) / gridSize) + 1
    const tapeOffsetHr = (tapeWidth - (charCols - 1) * gridSize) / 2

    const tapeLines = Math.ceil(length / charCols)
    const charHeight = gridSize * (rows - 1) + tapeOffset * 2
    const lineHeight = charHeight + lineSpacing
    const height = tapeLines * (charHeight + outerOffset) + outerOffset

    // Render punched holes
    const marksPath = []
    const holesPath = []
    let char, charX, charY, i, j

    for (i = 0; i < length; i++) {
      char = tape[i]

      // Layout tape char
      charX = outerOffset + tapeOffsetHr + (i % charCols) * gridSize
      charY = outerOffset + tapeOffset + Math.floor(i / charCols) * lineHeight

      // Render char
      for (j = 0; j < rows; j++) {
        if (j === sprocketIndex) {
          // Render sprocket hole
          holesPath.push(`M ${charX - s} ${charY + j * gridSize}`)
          holesPath.push(`a ${s},${s} 0 1,0 ${sprocketSize},0`)
          holesPath.push(`a ${s},${s} 0 1,0 ${-sprocketSize},0`)
        } else {
          if ((char & 1) !== 0) {
            // Render punched hole
            holesPath.push(`M ${charX - r} ${charY + j * gridSize}`)
            holesPath.push(`a ${r},${r} 0 1,0 ${holeSize},0`)
            holesPath.push(`a ${r},${r} 0 1,0 ${-holeSize},0`)
          }
          char = char >> 1
        }
      }

      if (i % rows === 0 && rows >= 5) {
        // Render base mark
        marksPath.push(`M ${charX - s},${charY - tapeOffset + charHeight + markOffset}`)
        marksPath.push(`a ${s},${s} 0 1,0 ${sprocketSize},0`)
        marksPath.push(`a ${s},${s} 0 1,0 ${-sprocketSize},0`)
      }
    }

    // Render tape line rects
    const tapesPath = []
    let y, tapeX, tapeY, tapeLineWidth

    for (y = 0; y < tapeLines; y++) {
      // Layout tape
      tapeX = outerOffset
      tapeY = outerOffset + y * lineHeight
      tapeLineWidth = y < tapeLines - 1 || length % charCols === 0
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
    this._$tapes.setAttribute('d', tapesPath.join(' '))
    this._$marks.setAttribute('d', marksPath.join(' '))
    this._$holes.setAttribute('d', holesPath.join(' '))
  }
}
