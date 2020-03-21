
import LibraryPanel from '../LibraryPanel'
import React, { useState } from 'react'
import Viewable from '../Viewable'

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
        <Viewable instance={props.pipe} />
      </div>
    </div>
  )
}
