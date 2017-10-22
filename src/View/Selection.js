
import Analytics from '../Analytics'
import View from '../View'

/**
 * Selection View.
 */
export default class SelectionView extends View {
  /**
   * View constructor.
   */
  constructor (factory) {
    super()
    this._factory = factory
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    let brickNames = this._factory.getIdentifiers()

    let categories = []
    let categoryChoices = []

    // go through bricks and compose category choices
    brickNames.forEach(name => {
      let choice = this._factory.getMeta(name)
      let index = categories.indexOf(choice.category)
      if (index === -1) {
        categories.push(choice.category)
        categoryChoices.push([choice])
      } else {
        categoryChoices[index].push(choice)
      }
    })

    return View.createElement('div', {
      className: 'selection'
    }, [
      View.createElement('ul', {
        className: 'selection__categories'
      }, categories.map((category, index) =>
        this.renderCategory(category, categoryChoices[index])
      ))
    ])
  }

  /**
   * Renders choices category.
   * @protected
   * @param {string} category
   * @param {object[]} choices
   * @return {HTMLElement}
   */
  renderCategory (category, choices) {
    return View.createElement('li', {
      className: 'selection__category'
    }, [
      View.createElement('h4', {
        className: 'selection__category-title'
      }, category),
      View.createElement('ul', {
        className: 'selection__choices'
      }, choices.map(this.renderChoice.bind(this)))
    ])
  }

  /**
   * Renders choice.
   * @protected
   * @param {object} choice
   * @return {HTMLElement}
   */
  renderChoice (choice) {
    return View.createElement('li', {
      className: 'selection__item'
    }, [
      View.createElement('a', {
        className: 'selection__choice',
        href: '#',
        onClick: evt => {
          evt.preventDefault()
          this.choiceDidClick(choice)
        }
      }, [
        View.createElement('span', {
          className: 'selection__title'
        }, choice.title)
      ])
    ])
  }

  /**
   * Triggered when the user chose a brick.
   * @param {object} choice Brick meta of chosen brick.
   */
  choiceDidClick (choice) {
    if (this.hasModel()) {
      this.getModel().selectionViewDidSelect(this, choice.name)

      Analytics.trackEvent('brick_add', {
        'event_category': 'bricks',
        'event_action': 'add',
        'event_label': choice.name
      })
    }
  }
}
