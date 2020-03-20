
import React from 'react'
import Icon from '../Icon'

export default function InputNumber(props: any): any {
  // TODO: Bring back display
  return (
    <div className="input-number">
      <button
        className="input-number__step-down"
        onClick={props.onStepDownClick}>
        <Icon name="minus" title="Step down" />
      </button>
      <input
        className="input-number__input"
        type="number"
        value={props.value}
        onChange={event => props.onChange(event.target.value)} />
      <button
        className="input-number__step-up"
        onClick={props.onStepUpClick}>
        <Icon name="plus" title="Step up" />
      </button>
    </div>
  )
}
