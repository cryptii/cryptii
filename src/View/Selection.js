
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

    // render each category
    let $categories = document.createElement('ul')
    $categories.classList.add('selection__categories')

    categories.forEach((category, index) => {
      let choices = categoryChoices[index]
      let $category = this.renderCategory(category, choices)
      $categories.appendChild($category)
    })

    let $root = document.createElement('div')
    $root.classList.add('selection')
    $root.appendChild($categories)
    return $root
  }

  /**
   * Renders choices category.
   * @protected
   * @param {string} category
   * @param {object[]} choices
   * @return {HTMLElement}
   */
  renderCategory (category, choices) {
    let $title = document.createElement('h4')
    $title.classList.add('selection__category-title')
    $title.innerText = category

    let $choices = document.createElement('ul')
    $choices.classList.add('selection__choices')

    // render each choice
    choices
      .map(this.renderChoice.bind(this))
      .forEach($choice => $choices.appendChild($choice))

    let $category = document.createElement('li')
    $category.classList.add('selection__category')
    $category.appendChild($title)
    $category.appendChild($choices)
    return $category
  }

  /**
   * Renders choice.
   * @protected
   * @param {object} choice
   * @return {HTMLElement}
   */
  renderChoice (choice) {
    let $title = document.createElement('span')
    $title.classList.add('selection__title')
    $title.innerText = choice.title

    let $link = document.createElement('a')
    $link.classList.add('selection__choice')
    $link.appendChild($title)
    $link.setAttribute('href', '#')
    $link.addEventListener('click', evt => {
      evt.preventDefault()
      this.hasModel() &&
        this.getModel().selectionViewDidSelect(this, choice.name)
    })

    let $choice = document.createElement('li')
    $choice.classList.add('selection__item')
    $choice.appendChild($link)
    return $choice
  }
}
