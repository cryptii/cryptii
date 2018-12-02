
import BrickView from './Brick'
import Encoder from '../Encoder'
import View from '../View'

// scroll handle speed (px / second)
const scrollHandleSpeed = 1000

const scrollHandleDisabledClass = 'pipe__scroll-handle--disabled'

// brick data mime type, used when dragging bricks between browser windows
const brickMimeType = 'application/vnd.cryptii.brick+json'

/**
 * Pipe view
 */
export default class PipeView extends View {
  /**
   * Pipe view constructor
   */
  constructor () {
    super()

    this._$scrollable = null
    this._$content = null

    this._draggingBrickView = null
    this._draggingTargetIndex = null

    // parts
    this._$pipeParts = []
    this._pipePartPositions = []
    this._pipePartIndex = []

    // scroll facts
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
      onDragEnter: this.scrollHandleDidStart.bind(this, 0),
      onMouseLeave: this.scrollHandleDidStop.bind(this),
      onDragLeave: this.scrollHandleDidStop.bind(this)
    })

    this._$scrollHandleRight = View.createElement('div', {
      className: 'pipe__scroll-handle pipe__scroll-handle--right',
      onMouseEnter: this.scrollHandleDidStart.bind(this, 1),
      onDragEnter: this.scrollHandleDidStart.bind(this, 1),
      onMouseLeave: this.scrollHandleDidStop.bind(this),
      onDragLeave: this.scrollHandleDidStop.bind(this)
    })

    // bind to existing pipe element if any
    let $root = document.querySelector('.pipe')
    if ($root === null) {
      $root = View.createElement('div')
      $root.classList.add('pipe')
    }

    // bind drag events
    $root.ondrop = this.dragDidDrop.bind(this)
    $root.ondragenter = this.dragDidEnterPipe.bind(this)
    $root.ondragover = this.dragDidOverPipe.bind(this)

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

    // store reference and index for each pipe part
    this._$pipeParts = []
    this._pipePartIndex = []

    // compose pipe
    let $pipePart
    let cowards = []
    for (let i = 0; i < bricks.length; i++) {
      if (!bricks[i].isHidden()) {
        // append brick
        $pipePart = this._createPipePart(i)
        this._$pipeParts.push($pipePart)
        this._pipePartIndex.push(i)

        $content.appendChild($pipePart)
        $content.appendChild(this._createBrickPart(brickViews[i]))
      } else {
        // collect cowards
        cowards.push(bricks[i])

        // append cowards group if this is the last coward in the group
        if (i + 1 === bricks.length || !bricks[i + 1].isHidden()) {
          const index = i - cowards.length + 1
          $pipePart = this._createPipePart(index)
          this._$pipeParts.push($pipePart)
          this._pipePartIndex.push(index)
          $content.appendChild($pipePart)
          $content.appendChild(this._createCollapsedPart(cowards))
          cowards = []
        }
      }
    }

    // add end part
    $pipePart = this._createPipePart(brickViews.length)
    this._$pipeParts.push($pipePart)
    this._pipePartIndex.push(brickViews.length)
    $content.appendChild($pipePart)

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
      onClick: evt => {
        this.getModel().viewAddButtonDidClick(this, index)
        evt.preventDefault()
      },
      href: '#',
      draggable: false
    }, [
      View.createElement('div', {
        className: 'pipe__btn-add'
      }, 'Add encoder or viewer'),
      View.createElement('div', {
        className: 'pipe__drop-handle'
      })
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
      className: `pipe__part-brick pipe__part-brick--${type}`,
      draggable: true,
      onMouseDown: this.brickDragWillStart.bind(this, brickView),
      onDragStart: this.brickDragDidStart.bind(this, brickView),
      onDragEnd: this.brickDragDidEnd.bind(this, brickView)
    }, brickView.getElement())
  }

  /**
   * Creates collapsed part.
   * @return {HTMLElement}
   */
  _createCollapsedPart (bricks) {
    return View.createElement('a', {
      className: `pipe__part-collapsed`,
      onClick: evt => {
        this.getModel().viewHiddenBrickGroupDidClick(this, bricks)
        evt.preventDefault()
      },
      href: '#',
      draggable: false
    }, bricks.map(() =>
      View.createElement('div', {
        className: `pipe__part-collapsed-fold`
      })
    ))
  }

  /**
   * Checks if given drop event is a brick drop.
   * @param {DragEvent} evt Drop event
   * @return {boolean}
   */
  isBrickDragEvent (evt) {
    // check if brick mime type is among the drop types
    const types = evt.dataTransfer.types
    if (types.contains !== undefined) {
      // in Edge, types is a DOMStringList
      return types.contains(brickMimeType)
    }
    return types.indexOf(brickMimeType) !== -1
  }

  /**
   * Checks wether the given mouse or drag event's target is an input field.
   * @param {MouseEvent} evt Mouse or drag event
   */
  isFieldMouseEvent (evt) {
    const targetType = evt.target.nodeName.toLowerCase()
    return ['textarea', 'input'].indexOf(targetType) !== -1
  }

  /**
   * Triggered before any dragging events may be triggered.
   * @param {BrickView} brickView Brick view that may be dragged
   * @param {MouseEvent} evt Mouse down event
   */
  brickDragWillStart (brickView, evt) {
    // prevent drag events originating from fields to
    //  allow trouble-free text selection & dragging
    // prevent drag events on bricks with invalid settings
    //  because they can't be serialized
    if (this.isFieldMouseEvent(evt) ||
        !brickView.getModel().isValid()) {
      // temporary disable dragging the brick's pipe part
      const $brickPart = brickView.getElement().parentNode
      if ($brickPart) {
        $brickPart.draggable = false
        setTimeout(() => {
          $brickPart.draggable = true
        }, 500)
      }
    }
  }

  /**
   * Triggered when the user starts dragging a brick part.
   * @param {BrickView} brickView Brick view being dragged
   * @param {DragEvent} evt Drag event
   */
  brickDragDidStart (brickView, evt) {
    // ignore drag events originating from fields to allow text dragging
    if (this.isFieldMouseEvent(evt)) {
      return
    }

    // save the source brick reference
    this._draggingBrickView = brickView
    // populate drag data transfer
    const brickDataJson = JSON.stringify(brickView.getModel().serialize())
    evt.dataTransfer.setData(brickMimeType, brickDataJson)
    evt.dataTransfer.setData('application/json', brickDataJson)
    evt.dataTransfer.effectAllowed = 'copyMove'
  }

  /**
   * Triggered when a brick drag ends.
   * @param {BrickView} brickView Brick view being dragged
   * @param {DragEvent} evt
   */
  brickDragDidEnd (brickView, evt) {
    this._draggingBrickView = null
    this.setDraggingPipePartIndex(null)
  }

  /**
   * Triggered when the user drag enters the pipe.
   * @param {DragEvent} evt
   */
  dragDidEnterPipe (evt) {
    if (this.isBrickDragEvent(evt)) {
      // needed to trigger the drop event for this drag
      evt.preventDefault()
    }
  }

  /**
   * Triggered when the user drags over the pipe.
   * @param {DragEvent} evt [description]
   * @return {[type]} [description]
   */
  dragDidOverPipe (evt) {
    if (this.isBrickDragEvent(evt)) {
      evt.preventDefault()

      const dragX = evt.pageX + this._scrollPosition
      const dragY = evt.pageY

      // find nearest pipe part
      let nearestDistance = null
      let nearestIndex = 0

      this._pipePartPositions.forEach((position, index) => {
        const distance = Math.sqrt(
          Math.pow(dragX - position.x, 2) +
          Math.pow(dragY - position.y, 2))

        if (nearestDistance === null || distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      this.setDraggingPipePartIndex(nearestIndex)
    }
  }

  /**
   * Triggered when the user drops something on the pipe.
   * @param {DragEvent} evt
   */
  dragDidDrop (evt) {
    if (this.isBrickDragEvent(evt)) {
      // handle brick drop
      evt.preventDefault()
      const copy = evt.dataTransfer.effectAllowed === 'copy'
      const insertIndex = this._pipePartIndex[this._draggingTargetIndex]
      this.setDraggingPipePartIndex(null)

      if (this._draggingBrickView !== null) {
        const brick = this._draggingBrickView.getModel()
        this.getModel().viewBrickDidDrop(this, insertIndex, brick, copy)
      } else {
        const brickData = JSON.parse(evt.dataTransfer.getData(brickMimeType))
        this.getModel().viewBrickDidDrop(this, insertIndex, brickData, copy)
      }
    }
  }

  /**
   * Updates the pipe part index the user is currently dragging to.
   * Updates the drop handle.
   * @param {number} index Pipe part index
   */
  setDraggingPipePartIndex (index) {
    if (this._draggingTargetIndex !== index) {
      // remove dragging class from current target
      if (this._draggingTargetIndex !== null) {
        this._$pipeParts[this._draggingTargetIndex]
          .classList.remove('pipe__part-pipe--dragging')
      }
      // update index
      this._draggingTargetIndex = index
      // add dragging class on new target
      if (index !== null) {
        this._$pipeParts[this._draggingTargetIndex]
          .classList.add('pipe__part-pipe--dragging')
        this.getElement().classList.add('pipe--dragging')
      } else {
        this.getElement().classList.remove('pipe--dragging')
      }
    }
  }

  /**
   * Triggered when using the mouse wheel on the view.
   * @param {WheelEvent} evt
   */
  mouseDidWheel (evt) {
    const deltaX = evt.deltaX
    const deltaY = evt.deltaY

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
    const direction = this._scrollHandleIndex === 0 ? -1 : 1
    const duration = (new Date().getTime() - this._scrollHandleStartTime) / 1000
    const delta = direction * Math.pow(duration, 2) * scrollHandleSpeed
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

    // track pipe part positions to prepare for dragging events
    const scrollY = window.scrollY
    this._pipePartPositions = this._$pipeParts.map($pipePart => {
      const rect = $pipePart.getBoundingClientRect()
      return {
        x: rect.left + rect.width * 0.5 + this._scrollPosition,
        y: rect.top + rect.height * 0.5 + scrollY
      }
    })
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
      this._$content.style.transform = x > 0 ? `translate(${-x}px, 0)` : ''

      this._scrollPosition = x
    }
    return this
  }
}
