
import Icon from '../Icon'
import React from 'react'
import Viewable from '../Viewable'

export default function Form(props: any): any {
  let cols = 0
  return (
    <div className="form">
      {props.fields.map((field: any) => {
        let fieldClassName = 'form__field'

        // Keep track of field columns
        const width = field.getWidth()
        cols += width
        const first = cols > 12 || cols == width
        if (first) {
          cols = width
          fieldClassName += ' form__field--first'
        }

        return (
          <div
            key={field.getName()}
            className={fieldClassName}
            data-width={width}
          >
            <Viewable instance={field} />
          </div>
        )
      })}
      {props.expandable && (
        <button className="form__toggle" onClick={props.onToggleClick}>
          <Icon name={props.expanded ? 'chevronUp' : 'chevronDown'} />
          {props.expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
