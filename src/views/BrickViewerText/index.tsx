
import React, { useRef, useEffect } from 'react'
import Brick from '../Brick'
import InputText from '../InputText'

export default function BrickViewerText(props: any): any {
  return (
    <Brick {...props}>
      <InputText
        value={props.content}
        onChange={props.onChange}
        multiline={true} />
    </Brick>
  )
}
