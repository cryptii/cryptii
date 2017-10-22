
import BrickView from './Brick'
import View from '../View'

// scroll handle speed (px / second)
const scrollHandleSpeed = 1000

const scrollHandleDisabledClass = 'pipe__scroll-handle--disabled'

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

    // scroll handle
    this._scrollHandleIndex = null
    this._scrollHandleStartPosition = null
    this._scrollHandleStartTime = null
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    this._$content = View.createElement('div', {
      className: 'pipe__content'
    })

    this._$scrollHandleLeft = View.createElement('div', {
      className:
        'pipe__scroll-handle pipe__scroll-handle--left ' +
        'pipe__scroll-handle--disabled',
      onMouseEnter: this.scrollHandleDidStart.bind(this, 0),
      onMouseLeave: this.scrollHandleDidStop.bind(this)
    })

    this._$scrollHandleRight = View.createElement('div', {
      className: 'pipe__scroll-handle pipe__scroll-handle--right',
      onMouseEnter: this.scrollHandleDidStart.bind(this, 1),
      onMouseLeave: this.scrollHandleDidStop.bind(this)
    })

    this._$scrollable = View.createElement('div', {
      className: 'pipe__scrollable'
    }, [
      this._$content,
      this._$scrollHandleLeft,
      this._$scrollHandleRight
    ])

    // bind to existing pipe element if any
    let $root = document.querySelector('.pipe')

    if ($root === null) {
      $root.classList.add('pipe')
    }

    $root.appendChild(this._$scrollable)
    $root.addEventListener('wheel', this.mouseDidWheel.bind(this))

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
    return View.createElement('a', {
      className: 'pipe__part-pipe',
      href: '#',
      onClick: evt => this.addButtonDidClick(evt, index)
    }, [
      View.createElement('div', {
        className: 'pipe__btn-add'
      }, 'Add Encoder or Viewer')
    ])
  }

  /**
   * Creates brick part.
   * @param {BrickView} brickView
   * @return {HTMLElement}
   */
  _createBrickPart (brickView) {
    return View.createElement('div', {
      className: 'pipe__part-brick'
    }, brickView.getElement())
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
   * Triggered when scroll handle scroll starts.
   * @param {Number} index
   */
  scrollHandleDidStart (index) {
    this._scrollHandleIndex = index
    this._scrollHandleStartPosition = this._scrollPosition
    this._scrollHandleStartTime = new Date().getTime()

    window.requestAnimationFrame(this.scrollHandleDidScroll.bind(this))
  }

  /**
   * Triggered at each scroll handle scroll tick.
   */
  scrollHandleDidScroll () {
    if (this._scrollHandleIndex === null) {
      // stop when scroll handle is no longer active
      return
    }

    // calculate intermediate scroll position
    let direction = this._scrollHandleIndex === 0 ? -1 : 1
    let duration = (new Date().getTime() - this._scrollHandleStartTime) / 1000
    let delta = direction * Math.pow(duration, 2) * scrollHandleSpeed
    this.scrollTo(this._scrollHandleStartPosition + delta)

    window.requestAnimationFrame(this.scrollHandleDidScroll.bind(this))
  }

  /**
   * Triggered when scroll handle stops scrolling.
   */
  scrollHandleDidStop () {
    this._scrollHandleIndex = null
    this._scrollHandleStartPosition = null
    this._scrollHandleStartTime = null
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

    // update scroll handles
    this._$scrollHandleLeft.classList.toggle(
      scrollHandleDisabledClass,
      this._scrollPosition === 0)

    this._$scrollHandleRight.classList.toggle(
      scrollHandleDisabledClass,
      this._scrollPosition === this._scrollMax)
  }

  /**
   * Scrolls to given position. Respects scroll bounds.
   * @param {Number} [x=0] Scroll position.
   * @return {PipeView} Fluent interface
   */
  scrollTo (x = 0) {
    // remove decimal digits
    x = parseInt(x)

    // respect bounds
    x = Math.max(Math.min(x, this._scrollMax), 0)

    // only proceed when something has changed
    if (this._scrollPosition !== x) {
      // left scroll handle
      if (x === 0) {
        this._$scrollHandleLeft.classList.add(scrollHandleDisabledClass)
        this.scrollHandleDidStop()
      } else if (this._scrollPosition === 0) {
        this._$scrollHandleLeft.classList.remove(scrollHandleDisabledClass)
      }

      // right scroll handle
      if (x === this._scrollMax) {
        this._$scrollHandleRight.classList.add(scrollHandleDisabledClass)
        this.scrollHandleDidStop()
      } else if (this._scrollPosition === this._scrollMax) {
        this._$scrollHandleRight.classList.remove(scrollHandleDisabledClass)
      }

      // apply change to DOM
      let transform = x > 0 ? `translate(${-x}px, 0)` : ''
      this._$content.style.webkitTransform = transform
      this._$content.style.transform = transform

      this._scrollPosition = x
    }
    return this
  }
}
