
import React from 'react'

export default function InputSwitch(props: any): any {
  return (
    <label className="input-switch">
      <input
        className="input-switch__input"
        type="checkbox"
        checked={props.value}
        onChange={event => props.onChange(event.target.checked)} />
      <div className="input-switch__track">
        <div className="input-switch__thumb"></div>
      </div>
      <div className="input-switch__label">
        {props.value ? props.trueLabel || 'Yes' : props.falseLabel || 'No'}
      </div>
    </label>
  )
}
