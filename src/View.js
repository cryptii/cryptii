const nonStandardAttributes = {
  role: 'role',
  ariaHidden: 'aria-hidden',
  ariaLabel: 'aria-label'
}

/**
 * Represents a rectangular area on the screen
 * and manages the content in that area.
 */
export default class View {
  /**
   * Creates element with given tag, attributes and children.
   * @param {string} type
   * @param {object} attributes
   * @param {string|HTMLElement|HTMLElement[]} children
   * @return {HTMLElement}
   */
  static createElement (type, attributes = {}, children = null) {
    const $element = document.createElement(type)

    // set element attributes
    Object.keys(attributes).forEach(name => {
      const value = attributes[name]
      if (nonStandardAttributes[name] === undefined) {
        // lowercase event attributes
        const attributeName =
          name.indexOf('on') === 0
            ? name.toLowerCase()
            : name
        $element[attributeName] = value
      } else {
        // set non-standard attribute
        $element.setAttribute(nonStandardAttributes[name], value)
      }
    })

    // append children
    if (children !== null) {
      switch (Object.prototype.toString.call(children)) {
        case '[object String]':
          $element.innerText = children
          break
        case '[object Array]':
          children.forEach($child => $child && $element.appendChild($child))
          break
        default:
          $element.appendChild(children)
      }
    }
    return $element
  }

  /**
   * View constructor
   */
  constructor () {
    this._$root = null
    this._superview = null
    this._subviews = []
    this._model = null
    this._focus = false
    this._needsUpdate = false
  }

  /**
   * Returns root element.
   * @return {?HTMLElement}
   */
  getElement () {
    if (this._$root === null) {
      this.willRender()
      this._$root = this.render()
      this.didRender()
    }
    return this._$root
  }

  /**
   * Rerenders the view.
   * @return {View} Fluent interface
   */
  refresh () {
    const $oldRoot = this._$root
    if ($oldRoot === null) {
      // only refresh if there is an existing element
      return this
    }

    // render
    this._$root = null
    this.willRender()
    this._$root = this.render()
    this.didRender()

    // append each subview to new root element
    this.getSubviews().forEach(this.appendSubviewElement)

    // replace root node in dom
    if ($oldRoot && $oldRoot.parentNode) {
      $oldRoot.parentNode.replaceChild(this._$root, $oldRoot)
    }

    return this
  }

  /**
   * Renders the view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    return View.createElement('div')
  }

  /**
   * Updates this view at next frame.
   * @return {View} Fluent interface
   */
  setNeedsUpdate () {
    if (!this._needsUpdate) {
      this._needsUpdate = true
      window.requestAnimationFrame(() => {
        this._needsUpdate = false
        this.update()
      })
    }
    return this
  }

  /**
   * Updates view on model change.
   * @override
   * @return {View} Fluent interface
   */
  update () {
  }

  /**
   * Triggered before rendering root element.
   * @override
   */
  willRender () {
  }

  /**
   * Triggered after rendering root element.
   * @override
   */
  didRender () {
    this.update()
  }

  /**
   * Layouts view and its subviews.
   * @return {View}
   */
  layout () {
    this._subviews.forEach(subview => subview.layout())
    return this
  }

  /**
   * Adds subview.
   * @param {View} view View to add as subview
   * @return {View} Fluent interface
   */
  addSubview (view) {
    // make sure view is detached
    view.removeFromSuperview()

    // add view to subviews
    this.appendSubviewElement(view)
    view.setSuperview(this)
    this._subviews.push(view)
  }

  /**
   * Returns subviews.
   * @return {View[]} Subviews
   */
  getSubviews () {
    return this._subviews
  }

  /**
   * Injects subview's root element into own DOM structure.
   * Override this method to choose how to inject which kind of views.
   * @protected
   * @override
   * @param {View} view
   * @return {View} Fluent interface
   */
  appendSubviewElement (view) {
    // default behaviour: append subview element to own root element
    if (view.getElement().parentNode !== this.getElement()) {
      this.getElement().appendChild(view.getElement())
    }
    return this
  }

  /**
   * Remove subview.
   * @param {View} view View to be removed from subviews.
   * @return {View} Fluent interface
   */
  removeSubview (view) {
    const index = this._subviews.indexOf(view)
    if (index !== -1) {
      this._subviews.splice(index, 1)
      view.setSuperview(null)
      this.removeSubviewElement(view)
    }
  }

  /**
   * Removes previously added subview element from own DOM structure.
   * @protected
   * @override
   * @param {View} view
   * @return {View} Fluent interface
   */
  removeSubviewElement (view) {
    // remove subview element from its parent node
    const $element = view.getElement()
    if ($element.parentNode !== null) {
      $element.parentNode.removeChild(view.getElement())
    }
    return this
  }

  /**
   * Remove self from superview.
   * @return {View} Fluent interface
   */
  removeFromSuperview () {
    if (this._superview !== null) {
      this._superview.removeSubview(this)
    }
    return this
  }

  /**
   * Returns superview.
   * @return {?View} Superview
   */
  getSuperview () {
    return this._superview
  }

  /**
   * Sets superview.
   * @param {?View} view
   * @return {View} Fluent interface
   */
  setSuperview (view) {
    this._superview = view
    return this
  }

  /**
   * Focus this view.
   * @return {View} Fluent interface
   */
  focus () {
    return this.setFocus(true)
  }

  /**
   * Release this view's focus.
   * @return {View} Fluent interface
   */
  blur () {
    return this.setFocus(false)
  }

  /**
   * Sets focus.
   * @param {boolean} focus
   * @return {View} Fluent interface
   */
  setFocus (focus) {
    if (focus !== this._focus) {
      this._focus = focus
      if (focus) {
        // inform superview
        if (this._superview !== null) {
          this._superview.subviewDidFocus(this)
        }
        this.didFocus()
      } else {
        // blur subviews
        this._subviews.forEach(subview => subview.blur())
        this.didBlur()
      }
    }
    return this
  }

  /**
   * Returns true, if view or one of the subviews has focus.
   * @return {boolean}
   */
  hasFocus () {
    return this._focus
  }

  /**
   * Triggered when a subview receives focus.
   * @param {View} subview
   */
  subviewDidFocus (subview) {
    if (this.hasFocus()) {
      // blur other subviews
      this._subviews
        .filter(view => view !== subview)
        .forEach(view => view.blur())
    } else {
      this.focus()
    }
  }

  /**
   * Triggered when view receives focus.
   */
  didFocus () {

  }

  /**
   * Triggered when view loses focus.
   */
  didBlur () {

  }

  /**
   * Returns the model object that manages this view.
   * @return {?Object}
   */
  getModel () {
    return this._model
  }

  /**
   * Returns true, if model is set.
   * @return {boolean} True, if model is set
   */
  hasModel () {
    return this._model !== null
  }

  /**
   * Sets the model.
   * @param {?Object} model
   * @return {View} Fluent interface
   */
  setModel (model) {
    this._model = model
    return this
  }
}
