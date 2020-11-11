import React, { useContext } from 'react'
import Image from 'next/image'

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
  const topPiece = cell.pieces[cell.pieces.length - 1]

  return (
    <div
      className={'cell' + (isSelected ? ' cell-z' : '')}
      style={{ gridColumnStart, gridRowStart }}
    >
      <div
        className={'cell_content' + (isSelected ? ' cell-occupied' : '')}
        onClick={() => selectable && sendToGame('CELL.SELECT', { cell })}
      >
        <div
          className={
            'cell_clip ' + (topPiece?.ofPlayer === 1 ? 'player-1' : 'player-2')
          }
        >
          {topPiece ? (
            <div className="insect" style={{ padding: '20%' }}>
              <Image
                src={`/icons/${topPiece.insect.name.toLowerCase()}.svg`}
                unsized
                alt={`${topPiece.insect.name}`}
                priority
              />
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}

export default Cell
