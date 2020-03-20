
import * as React from 'react'
import Icon from '../Icon'

export default function Toolbar(props: any): any {
  return (
    <nav className="toolbar">
      <ul className="toolbar__items">
        {props.items.map((item: any) =>
          item !== 'divider'
          ? (
            <li className="toolbar__item">
              <button
                className="toolbar__button"
                disabled={!item.enabled}
                onClick={item.onClick}>
                <Icon
                  name={item.icon}
                  title={item.title} />
              </button>
            </li>
          )
          : (
            <li className="toolbar__divider"></li>
          )
        )}
      </ul>
    </nav>
  )
}
