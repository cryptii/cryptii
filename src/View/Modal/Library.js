import ModalView from '../Modal.js'
import View from '../../View.js'

/**
 * Library modal view
 */
export default class LibraryModalView extends ModalView {
  /**
   * Constructor
   * @param {object[]} library Array of brick meta objects.
   */
  constructor (library) {
    super('Library')
    this._library = library
    this._filteredLibrary = library
    this._categories = {}
  }

  /**
   * Resets filters offering all bricks available in the library.
   * @return {LibraryModalView} Fluent interface
   */
  clearFilter () {
    this._filteredLibrary = this._library
    this.refresh()
    return this
  }

  /**
   * Applies the given filter callback on the brick library array.
   * @param {function} filter Filter function
   * @return {LibraryModalView} Fluent interface
   */
  applyFilter (filter) {
    this._filteredLibrary = this._library.filter(filter)
    this.refresh()
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('modal-library')
    return $root
  }

  /**
   * Renders modal content.
   * @protected
   * @return {HTMLElement}
   */
  renderContent () {
    return View.createElement('div', {
      className: 'modal__content'
    }, [
      this.renderBricks()
    ])
  }

  /**
   * Renders bricks list.
   * @protected
   * @return {HTMLElement}
   */
  renderBricks () {
    // Compose categories
    const categories = []
    const categoryBricks = []

    this._filteredLibrary.forEach(meta => {
      const index = categories.indexOf(meta.category)
      if (index === -1) {
        categories.push(meta.category)
        categoryBricks.push([meta])
      } else {
        categoryBricks[index].push(meta)
      }
    })

    // Render categories of bricks
    return View.createElement('ul', {
      className: 'modal-library__categories'
    }, categories.map((category, index) =>
      View.createElement('li', {
        className: 'modal-library__category'
      }, [
        View.createElement('span', {
          className: 'modal-library__category-title'
        }, category),
        View.createElement('ul', {
          className: 'modal-library__bricks'
        }, categoryBricks[index].map(this.renderBrick.bind(this)))
      ])
    ))
  }

  /**
   * Renders single brick entry.
   * @protected
   * @return {HTMLElement}
   */
  renderBrick (brick) {
    return View.createElement('li', {
    }, [
      View.createElement('button', {
        className: 'modal-library__brick modal-library__brick--' + brick.type,
        onClick: evt => {
          evt.preventDefault()
          this.finish(brick.name)
        }
      }, [
        View.createElement('span', {
          className: 'modal-library__brick-title'
        }, brick.title)
      ])
    ])
  }
}
