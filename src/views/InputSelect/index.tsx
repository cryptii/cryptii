
import React from 'react'
import Icon from '../Icon'

export default function InputSelect(props: any): any {
  const labels = props.labels || props.values
  return (
    <div className="input-select">
      <select
        className="input-select__select"
        value={props.value}
        onChange={event => props.onChange(event.target.value)}>
        {props.values.map((value: string, index: number) => (
          <option key={value} value={value}>{labels[index]}</option>
        ))}
      </select>
      <div className="input-select__chevron">
        <Icon name="chevronDown" />
      </div>
    </div>
  )
}
