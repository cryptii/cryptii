
import React, { useState } from 'react'
import LibraryPanel from '../LibraryPanel'

export default function App(props: any): any {
  const [libraryVisible, setLibraryVisible] = useState(false)

  return (
    <div className="app">
      {props.panel && libraryVisible && (
        <div className="app__panel">
          {props.panel}
        </div>
      )}
      <div className="app__content">
        {props.pipe}
      </div>
    </div>
  )
}
