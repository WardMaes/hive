import React, { useContext } from 'react'

import { gameContext } from '../context/machines'

import { haveSameCubeCoordinates } from '../lib/hex'

import { Cell as CellType } from '../machines/game'

type CellProps = {
  cell: CellType
  gridColumnStart: number
  gridRowStart: number
}

const Cell = ({ cell, gridColumnStart, gridRowStart }: CellProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  const selectedPiece = gameState.context.selectedPiece
  const isSelected =
    selectedPiece && haveSameCubeCoordinates(selectedPiece.coord, cell.coord)

  return (
    <div
      className={'cell' + (isSelected ? ' cell-z' : '')}
      style={{ gridColumnStart, gridRowStart }}
    >
      <div
        className={'cell_content' + (isSelected ? ' cell-occupied' : '')}
        onClick={() => sendToGame(isSelected ? 'UNSELECT' : 'SELECT', { cell })}
      >
        <div className="cell_clip">{isSelected && 'selected'}</div>
      </div>
    </div>
  )
}

export default Cell