
import BrickView from './Brick'
import View from '../View'

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
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._$content = document.createElement('div')
    this._$content.classList.add('pipe__content')

    let $scrollable = document.createElement('div')
    $scrollable.classList.add('pipe__scrollable')
    $scrollable.appendChild(this._$content)

    // bind to existing pipe element if any
    let $root = document.querySelector('.pipe')

    if ($root === null) {
      $root.classList.add('pipe')
    }

    $root.appendChild($scrollable)
    return $root
  }

  /**
   * Injects subview's root element into own DOM structure.
   * @protected
   * @param {View} view
   * @return {PipeView} Fluent interface
   */
  appendSubviewElement (view) {
    if (view instanceof BrickView) {
      this._integrateBrickViews()
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
    super.removeSubviewElement(view)
    if (view instanceof BrickView) {
      this._integrateBrickViews()
    }
    return this
  }

  /**
   * Integrates brick view elements inside pipe structure.
   * @return {PipeView} Fluent interface
   */
  _integrateBrickViews () {
    // gather brick views in order
    let brickViews = this.getModel().getBricks().map(brick => brick.getView())

    this.getElement()
    let $content = this._$content

    // detach each brick subview element without breaking it
    // (emptying parent via innerHTML does not work in IE11)
    brickViews.forEach(brickView => {
      let $element = brickView.getElement()
      $element.parentNode && $element.parentNode.removeChild($element)
    })

    // empty content element
    $content.innerHTML = ''

    // add each brick and pipe parts
    brickViews.forEach((brickView, index) => {
      $content.appendChild(this._createPipePart(index))
      $content.appendChild(this._createBrickPart(brickView))
    })

    // add end part
    $content.appendChild(this._createPipePart(brickViews.length))

    return this
  }

  /**
   * Creates pipe part.
   * @param {number} index
   * @return {HTMLElement}
   */
  _createPipePart (index) {
    let $addButton = document.createElement('div')
    $addButton.classList.add('pipe__btn-add')
    $addButton.innerText = 'Add Encoder or Viewer'

    let $pipePart = document.createElement('a')
    $pipePart.classList.add('pipe__part-pipe')
    $pipePart.setAttribute('href', '#')
    $pipePart.addEventListener('click', evt =>
      this.addButtonDidClick(evt, index))
    $pipePart.appendChild($addButton)

    return $pipePart
  }

  /**
   * Creates brick part.
   * @param {BrickView} brickView
   * @return {HTMLElement}
   */
  _createBrickPart (brickView) {
    let $brickPart = document.createElement('div')
    $brickPart.classList.add('pipe__part-brick')
    $brickPart.appendChild(brickView.getElement())
    return $brickPart
  }

  /**
   * Triggered when user clicked on the button.
   * @protected
   * @param {Event} evt
   * @param {number} index
   */
  addButtonDidClick (evt, index) {
    this.getModel().viewAddButtonDidClick(this, index)
    evt.preventDefault()
  }
}
