
import React from 'react'

/**
 * Renders the given viewable instance.
 * @param props - Props
 */
export default function Viewable(props: any): any {
  return props.instance.render()
}
