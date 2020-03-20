
import React from 'react'
import InputText from '../InputText'

export default function LibraryPanel(props: any): any {
  return (
    <div className="library-panel">
      <h3 className="library-panel__headline">Library</h3>
      <div className="library-panel__search">
        <InputText
          onChange={props.onSearchChange}
          value={props.search}
          placeholder="Search…"
          monospaceFont={false} />
      </div>
      <div className="library-panel__library">
        <ul>
          {props.library.map((entry, index) => (
            <li>
              <button
                className="library-panel__entry"
                draggable={true}
                onClick={entry.onClick}
                onDragStart={entry.onDragStart}
              >
                {entry.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
