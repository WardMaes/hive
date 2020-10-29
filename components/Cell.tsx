import React from 'react'
import { useActor } from '@xstate/react'

const Cell = ({ cellRef }) => {
  const [state, send] = useActor(cellRef)

  return (
    <div
      className={
        'cell_content' + (state.context.occupied ? ' cell-occupied' : '')
      }
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div>
        {state.context.x}
        {state.context.y}
        {state.context.z}
      </div>
    </div>
  )
}

export default Cell
