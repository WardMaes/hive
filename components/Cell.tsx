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
      onClick={() => sendToTurn(isSelected ? 'UNSELECT' : 'SELECT', { cell })}
    >
      <div className="cell_clip">{isSelected && 'selected'}</div>
    </div>
  )
}

export default Cell
