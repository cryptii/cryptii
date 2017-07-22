
import BrickView from './Brick'
import Encoder from '../Encoder'
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
    // only consider brick subviews
    let brickViews = this.getSubviews()
      .filter(view => view instanceof BrickView)

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
    let storeIndex = 1
    brickViews.forEach(brickView => {
      $content.appendChild(this._createPipePart(storeIndex))
      $content.appendChild(this._createBrickPart(brickView, storeIndex))

      if (brickView.getModel() instanceof Encoder) {
        storeIndex++
      }
    })

    // add end part
    $content.appendChild(this._createPipePart(storeIndex))

    return this
  }

  /**
   * Creates pipe part.
   * @return {HTMLElement}
   */
  _createPipePart (storeIndex) {
    let $addButton = document.createElement('div')
    $addButton.classList.add('pipe__btn-add')
    $addButton.innerText = 'Add Encoder or Viewer'

    let $pipePart = document.createElement('a')
    $pipePart.classList.add('pipe__part-pipe')
    $pipePart.setAttribute('href', '#')
    $pipePart.addEventListener('click', this.addButtonDidClick.bind(this))
    storeIndex % 2 === 0 && $pipePart.classList.add('pipe__part-pipe--alt')
    $pipePart.appendChild($addButton)

    return $pipePart
  }

  /**
   * Creates brick part.
   * @return {HTMLElement}
   */
  _createBrickPart (brickView, storeIndex) {
    let $brickPart = document.createElement('div')
    $brickPart.classList.add('pipe__part-brick')
    $brickPart.appendChild(brickView.getElement())
    storeIndex % 2 === 0 && $brickPart.classList.add('pipe__part-brick--alt')
    return $brickPart
  }

  /**
   * Triggered when user clicked on the button.
   * @param {Event} evt
   */
  addButtonDidClick (evt) {
    // needs implementation
    evt.preventDefault()
    return false
  }
}
