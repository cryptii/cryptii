import ArrayUtil from '../ArrayUtil.js'
import PunchedTapeViewerView from '../View/Viewer/PunchedTape.js'
import Viewer from '../Viewer.js'

const meta = {
  name: 'punched-tape',
  title: 'Punched tape',
  category: 'View',
  type: 'viewer'
}

/**
 * Viewer brick for punched tape
 */
export default class PunchedTapeViewer extends Viewer {
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
    this._viewPrototype = PunchedTapeViewerView
    this.addSetting({
      name: 'rows',
      type: 'number',
      value: 8,
      min: 3,
      // Harvard Mark I used paper tape with twenty-four rows
      max: 25,
      randomizable: false
    })
  }

  /**
   * Performs view of given content.
   * @protected
   * @param {string} content
   * @return {void|Promise} Resolves when completed.
   */
  async performView (content) {
    const rows = this.getSettingValue('rows')
    const bytes = content.getBytes()
    const tape = ArrayUtil.resizeBitSizedArray(bytes, 8, rows, true)
    this.getView().setTape(tape, rows)
  }
}
