
import React from 'react'
import Brick from '../Brick'

export default function BrickPlaceholder(props: any): any {
  return (
    <Brick {...props}>
      <div className="brick-placeholder">
        {props.loading ? (
          <span>Loading…</span>
        ) : null}
        {props.errorType === 'not-found' ? (
          <>
            <span>Brick is not available right now. Please try again later.</span>
          </>
        ) : null}
        {props.errorType === 'error' ? (
          <>
            <span>{props.error}</span>
            <button onClick={props.onRetryClick}>Retry</button>
          </>
        ) : null}
      </div>
    </Brick>
  )
}
