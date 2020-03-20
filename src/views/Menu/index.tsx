
import React from 'react'

export default function Menu(props: any): any {
  return (
    <div className="menu">
      <ul className="menu__list">
        {props.items.map((item: any) => (
          <li className="menu__item">
            <button
              className="menu__button"
              onClick={item.onClick || props.onItemClick.bind(null, item)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
