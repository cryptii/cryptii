
import * as React from 'react'

// Icons
const icons: { [index: string] : string } = {
  caret: require('../../../assets/icons/caret.svg'),
  chevronDown: require('../../../assets/icons/chevron-down.svg'),
  chevronUp: require('../../../assets/icons/chevron-up.svg'),
  facebook: require('../../../assets/icons/facebook.svg'),
  link: require('../../../assets/icons/link.svg'),
  logo: require('../../../assets/icons/logo.svg'),
  menu: require('../../../assets/icons/menu.svg'),
  minus: require('../../../assets/icons/minus.svg'),
  plus: require('../../../assets/icons/plus.svg'),
  plusCircle: require('../../../assets/icons/plus-circle.svg'),
  plusCircleSolid: require('../../../assets/icons/plus-circle-solid.svg'),
  redo: require('../../../assets/icons/redo.svg'),
  trash: require('../../../assets/icons/trash.svg'),
  twitter: require('../../../assets/icons/twitter.svg'),
  undo: require('../../../assets/icons/undo.svg'),
}

export default function Icon(props: any): any {
  // Map icon
  const svg = icons[props.name]

  // Skip rendering icon if not available
  if (svg === undefined) {
    return (null)
  }

  // TODO: Inject title and description for accessibility
  return (
    <div className="icon" dangerouslySetInnerHTML={{ __html: svg }}></div>
  )
}
