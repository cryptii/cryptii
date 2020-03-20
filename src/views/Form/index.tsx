
import React from 'react'
import Icon from '../Icon'

export default function Form(props: any): any {
  let cols = 0
  return (
    <div className="form">
      {props.fields.map((field: any, index: number) => {
        let fieldClassName = 'form__field'

        // Keep track of field columns
        const width = props.widths[index]
        cols += width
        const first = cols > 12 || cols == width
        if (first) {
          cols = width
          fieldClassName += ' form__field--first'
        }

        return (
          <div
            key={props.fieldNames[index]}
            className={fieldClassName}
            data-width={width}
          >
            {field}
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
