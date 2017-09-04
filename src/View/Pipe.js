
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

    this._$scrollable = null
    this._$content = null

    this._scrollMax = 0
    this._scrollPosition = 0
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._$content = document.createElement('div')
    this._$content.classList.add('pipe__content')

    this._$scrollable = document.createElement('div')
    this._$scrollable.classList.add('pipe__scrollable')
    this._$scrollable.appendChild(this._$content)

    // bind to existing pipe element if any
    let $root = document.querySelector('.pipe')

    if ($root === null) {
      $root.classList.add('pipe')
    }

    $root.appendChild(this._$scrollable)
    return $root
  }

  /**
   * Triggered after rendering root element.
   */
  didRender () {
    // bind events
    this._$root.addEventListener('wheel', this.mouseDidWheel.bind(this))
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

  /**
   * Triggered when using the mouse wheel on the view.
   * @param {WheelEvent} evt
   */
  mouseDidWheel (evt) {
    let deltaX = evt.deltaX
    let deltaY = evt.deltaY

    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      // ignore vertical scrolling
      return
    }

    evt.preventDefault()
    this.scrollTo(this._scrollPosition + deltaX)
  }

  /**
   * Layouts view and its subviews.
   * @return {View}
   */
  layout () {
    super.layout()

    // measure scroll max
    this._scrollMax = this._$content.offsetWidth - this._$scrollable.offsetWidth

    // reset scroll position to respect new bounds
    this.scrollTo(this._scrollPosition)
  }

  /**
   * Scrolls to given position. Respects scroll bounds.
   * @param {Number} [x=0] Scroll position.
   * @return {PipeView} Fluent interface
   */
  scrollTo (x = 0) {
    // respect bounds
    x = Math.max(Math.min(x, this._scrollMax), 0)

    // only proceed when something has changed
    if (this._scrollPosition !== x) {
      this._scrollPosition = x

      // apply change to DOM
      let transform = x > 0 ? `translate(${-x}px, 0)` : ''
      this._$content.style.webkitTransform = transform
      this._$content.style.transform = transform
    }
    return this
  }
}
