import React from 'react'

const Cell = ({ cellRef }) => {
  // const [state, send] = useActor(cellRef)
  console.log('cellRef', cellRef)
  return (
    <div
      className={
        'cell_content'
        // 'cell_content' + (state.context.occupied ? ' cell-occupied' : '')
      }
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div>{JSON.stringify(cellRef, null, 2)}</div>
    </div>
  )
}

export default Cell
