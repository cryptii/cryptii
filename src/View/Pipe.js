
import BrickView from './Brick'
import Encoder from '../Encoder'
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

    // bind to existing pipe element if any
    let $root = document.querySelector('.pipe')
    if ($root === null) {
      $root = View.createElement('div')
      $root.classList.add('pipe')
    }

    // bind to existing scrollable if any
    this._$scrollable = $root.querySelector('.pipe__scrollable')
    if (this._$scrollable === null) {
      this._$scrollable = View.createElement('div', {
        className: 'pipe__scrollable'
      })
    }

    this._$scrollable.appendChild(this._$content)
    this._$scrollable.appendChild(this._$scrollHandleLeft)
    this._$scrollable.appendChild(this._$scrollHandleRight)

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
      this.update()
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
      this.update()
    }
    return this
  }

  /**
   * Integrates brick view elements inside pipe structure.
   * @return {PipeView} Fluent interface
   */
  update () {
    // gather brick views in order
    const bricks = this.getModel().getBricks()
    const brickViews = bricks.map(brick => brick.getView())

    this.getElement()
    const $content = this._$content

    // detach each brick subview element without breaking it
    // (emptying parent via innerHTML does not work in IE11)
    brickViews.forEach(brickView => {
      const $element = brickView.getElement()
      $element.parentNode && $element.parentNode.removeChild($element)
    })

    // empty content element
    $content.innerHTML = ''

    // compose pipe
    let cowards = []
    for (let i = 0; i < bricks.length; i++) {
      if (!bricks[i].isHidden()) {
        // append brick
        $content.appendChild(this._createPipePart(i))
        $content.appendChild(this._createBrickPart(brickViews[i]))
      } else {
        // collect cowards
        cowards.push(bricks[i])

        // append cowards group if this is the last coward in the group
        if (i + 1 === bricks.length || !bricks[i + 1].isHidden()) {
          $content.appendChild(this._createPipePart(i - cowards.length + 1))
          $content.appendChild(this._createCollapsedPart(cowards))
          cowards = []
        }
      }
    }

    // add end part
    $content.appendChild(this._createPipePart(brickViews.length))

    this.layout()
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
      onClick: this.addPartDidClick.bind(this, index),
      href: '#'
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
    const type = brickView.getModel() instanceof Encoder ? 'encoder' : 'viewer'
    return View.createElement('div', {
      className: `pipe__part-brick pipe__part-brick--${type}`
    }, brickView.getElement())
  }

  /**
   * Creates collapsed part.
   * @return {HTMLElement}
   */
  _createCollapsedPart (bricks) {
    return View.createElement('a', {
      className: `pipe__part-collapsed`,
      onClick: this.collapsedPartDidClick.bind(this, bricks),
      href: '#'
    }, bricks.map(() =>
      View.createElement('div', {
        className: `pipe__part-collapsed-fold`
      })
    ))
  }

  /**
   * Triggered when user clicks on pipe part.
   * @protected
   * @param {number} index
   * @param {Event} evt
   */
  addPartDidClick (index, evt) {
    this.getModel().viewAddButtonDidClick(this, index)
    evt.preventDefault()
  }

  /**
   * Triggered when user clicks on collapsed part.
   * @param {Brick[]} bricks
   * @param {Event} evt
   */
  collapsedPartDidClick (bricks, evt) {
    // make bricks in this collapsed group visible
    bricks.forEach(brick => brick.setHidden(false))
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
