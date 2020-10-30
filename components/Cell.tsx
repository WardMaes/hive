import React, { useContext } from 'react'

import { turnContext } from '../context/machines'

import { haveSameCubeCoordinates, Cell as CellType } from '../lib/hex'

type CellProps = {
  cell: CellType
}

const Cell = ({ cell }: CellProps) => {
  const [turnState, sendToTurn] = useContext(turnContext)

  const selectedPiece = turnState.context.selectedPiece
  const isSelected =
    selectedPiece && haveSameCubeCoordinates(selectedPiece, cell)

  return (
    <div
      className={'cell_content' + (isSelected ? ' cell-occupied' : '')}
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
      onClick={() => sendToTurn(isSelected ? 'UNSELECT' : 'SELECT', { cell })}
    >
      <div>{JSON.stringify(isSelected, null, 2)}</div>
    </div>
  )
}

export default Cell
