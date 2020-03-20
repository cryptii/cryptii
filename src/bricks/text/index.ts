
import Chain from '../../library/Chain'
import ViewerBrick from '../../library/Brick/ViewerBrick'
import TextViewerBrickView from '../../views/BrickViewerText'

/**
 * Viewer brick for viewing and editing content as plain text
 */
export default class TextViewer extends ViewerBrick {
  /**
   * React component this model is represented by
   */
  protected viewComponent = TextViewerBrickView

  /**
   * Brick title
   */
  protected title: string = 'Text'

  /**
   * React props passed to the view
   * @returns Object containing React props
   */
  compose (): any {
    return {
      ...super.compose(),
      content: this.getContent().getString(),
      onChange: this.setContent.bind(this)
    }
  }
}
