import React, { useContext } from 'react'

import { gameContext } from '../context/machines'

import { haveSameCubeCoordinates } from '../lib/hex'

import { Cell as CellType } from '../lib/game'

type CellProps = {
  selectable: boolean
  cell: CellType
  gridColumnStart: number
  gridRowStart: number
}

const Cell = ({
  selectable,
  cell,
  gridColumnStart,
  gridRowStart,
}: CellProps) => {
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
        onClick={
          selectable ? () => sendToGame('CELL.SELECT', { cell }) : undefined
        }
      >
        <div className="cell_clip">
          <div className="insect">
            {cell.pieces.length
              ? cell.pieces.map((piece) => piece.insect.name).join(', ')
              : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cell
