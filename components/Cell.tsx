import React, { useContext } from 'react'

import { gameContext } from '../context/machines'

import { haveSameCubeCoordinates } from '../lib/hex'

import { Cell as CellType } from '../machines/game'

type CellProps = {
  cell: CellType
}

const Cell = ({ cell }: CellProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  const selectedPiece = gameState.context.selectedPiece
  const isSelected =
    selectedPiece && haveSameCubeCoordinates(selectedPiece.coord, cell.coord)

  return (
    <div
      className={'cell_content' + (isSelected ? ' cell-occupied' : '')}
      onClick={() => sendToGame(isSelected ? 'UNSELECT' : 'SELECT', { cell })}
    >
      <div className="cell_clip">{isSelected && 'selected'}</div>
    </div>
  )
}

export default Cell
