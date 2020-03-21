
import Icon from '../Icon'
import Menu from '../Menu'
import React, { useRef, useState, useEffect } from 'react'
import Viewable from '../Viewable'

export default function Brick(props: any): any {
  // Reference to the brick element
  const brickRef = useRef<HTMLDivElement>(null)

  const [menuVisible, setMenuVisible] = useState(false)

  function onDragWillStart(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    // This `onMouseDown` event may lead to a drag event. To not interfere with
    // text selection in input and textarea fields we temporarily disable
    // dragging on this brick when the mouse down event originates from those
    const targetNode = (event.target as HTMLDivElement).nodeName.toLowerCase()
    const isTextTarget = targetNode === 'textarea' || targetNode === 'input'

    if (isTextTarget && brickRef.current !== null) {
      const $brick = brickRef.current
      $brick.draggable = false
      setTimeout(() => {
        $brick.draggable = true
      }, 500)
    }
  }

  return (
    <div
      ref={brickRef}
      className="brick"
      draggable={props.valid}
      onMouseDown={onDragWillStart}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      role="region"
      aria-label={props.title}
    >
      <header className="brick__header">
        <button className="brick__title">
          <h3 className="brick__title-inner">{props.title}</h3>
        </button>
        <button className="brick__btn-menu" onClick={() => setMenuVisible(!menuVisible)}>
          <Icon name="menu" label="Show menu" />
        </button>
        <div className="brick__menu">
          {menuVisible && (
            <Menu
              items={props.menuItems}
              onItemClick={props.onMenuItemClick} />
          )}
        </div>
      </header>
      <div className="brick__settings">
        <Viewable instance={props.settingsForm} />
      </div>
      {props.children && <div className="brick__content">{props.children}</div>}
    </div>
  )
}
