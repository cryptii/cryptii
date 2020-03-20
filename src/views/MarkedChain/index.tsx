
import React from 'react'

export default function MarkedChain(props: any): any {
  return (
    <pre className="marked-chain">
      {props.tokens.map((token: string, index: number) => (
        token === ''
          ? props.parts[index]
          : <mark className={token}>{props.parts[index]}</mark>
      ))}
    </pre>
  )
}
