
import View from '../View'
import BrickView from './Brick'

/**
 * Pipe View.
 */
export default class PipeView extends View {
  /**
   * Pipe constructor.
   */
  constructor () {
    super()

    this._$content = null
  }

  /**
   * Builds view.
   * @return {PipeView} Fluent interface
   */
  build () {
    let $track = document.createElement('div')
    $track.classList.add('pipe__track')

    let $header = document.createElement('header')
    $header.classList.add('pipe__header')

    this._$content = document.createElement('div')
    this._$content.classList.add('pipe__content')
    this._$content.appendChild($track)

    let $root = document.createElement('div')
    $root.classList.add('pipe')
    $root.appendChild($header)
    $root.appendChild(this._$content)

    this._$root = $root
    return this
  }

  /**
   * Injects subview's root element into own DOM structure.
   * @protected
   * @param {View} view
   * @return {PipeView} Fluent interface
   */
  appendSubviewElement (view) {
    if (view instanceof BrickView) {
      let $brickWrapper = document.createElement('div')
      $brickWrapper.classList.add('pipe__brick')
      $brickWrapper.appendChild(view.getElement())
      this._$content.appendChild($brickWrapper)
      return this
    }
    return super.appendSubviewElement(view)
  }

  /**
   * Removes previously added subview element from own DOM structure.
   * @protected
   * @param {View} view
   * @return {PipeView} Fluent interface
   */
  removeSubviewElement (view) {
    if (view instanceof BrickView) {
      // remove element with its wrapper
      this._$content.removeChild(view.getElement().parentNode)
      return this
    }
    return super.removeSubviewElement(view)
  }
}
