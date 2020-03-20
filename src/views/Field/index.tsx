
import React from 'react'

export default function Field(props: any): any {
  let className = 'field'
  if (!props.valid) {
    className += ' field--invalid'
  }

  return (
    <div className={className}>
      {props.label &&
        <label className="field__label" htmlFor="u3">{props.label}</label>}
      {props.children}
      {props.validationMessage &&
        <div className="field__message">{props.validationMessage}</div>}
    </div>
  )
}
