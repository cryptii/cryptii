
import Viewable from '../Viewable'
import LibraryPanelView from '../../views/LibraryPanel'

/**
 * Chain marked with tokens.
 */
export default class LibraryPanel extends Viewable {
  /**
   * React component this model is represented by
   */
  protected viewComponent = LibraryPanelView

  private search: string = ''

  // TODO: Where to put this data?
  private static library = [
    { name: 'text', title: 'Text' },
    { name: 'binary', title: 'Binary' },
    { name: 'caesar-cipher', title: 'Caesar cipher' },
    { name: 'navajo-code', title: 'Navajo code' },
    { name: 'blub', title: 'Nonexistant' },
  ]

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      search: this.search,
      onSearchChange: (value: string) => {
        this.search = value
        this.updateView()
        console.log('onSearchChange', value)
      },
      library: LibraryPanel.library
        .filter(entry => !this.search || entry.title.toLowerCase().indexOf(this.search.toLowerCase()) !== -1)
        .map((entry, index) => ({
          name: entry.name,
          title: entry.title,
          onDragStart: (event: React.DragEvent<HTMLElement>) => {
            // Populate drag data transfer
            const brickDataJson = JSON.stringify({ name: entry.name, title: entry.title })
            event.dataTransfer.setData('application/vnd.cryptii.brick+json', brickDataJson)
            event.dataTransfer.setData('application/json', brickDataJson)
            event.dataTransfer.effectAllowed = 'copy'
          },
        }))
    }
  }
}
