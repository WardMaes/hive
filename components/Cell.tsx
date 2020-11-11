import React, { useContext } from 'react'
import classNames from 'classnames'
import Image from 'next/image'

import { gameContext } from '../context/machines'

import { haveSameCubeCoordinates } from '../lib/hex'

import { Cell as CellType, getTopPieceOfCell } from '../lib/game'

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

  const selectedCell = gameState.context.selectedCell
  const isSelected =
    selectedCell && haveSameCubeCoordinates(selectedCell.coord, cell.coord)
  const topPiece = getTopPieceOfCell(cell)

  return (
    <div
      className={classNames('cell', {
        // 'cell-z': isSelected,
        selected: isSelected,
        tempCell: !topPiece,
        selectable: selectable,
      })}
      // className={'cell' + (isSelected ? ' cell-z' : '')}
      style={{ gridColumnStart, gridRowStart }}
    >
      <div
        className={classNames('cell_content', {
          isSelected: false /* TODO: add cell-occupied as class if selected */,
        })}
        onClick={() => selectable && sendToGame('CELL.SELECT', { cell })}
      >
        <div
          className={classNames('cell_clip ', {
            'player-1': topPiece && topPiece.ofPlayer === 1,
            'player-2': topPiece && topPiece.ofPlayer === 2,
            // (topPiece?.ofPlayer === 1 ? 'player-1' : 'player-2')
          })}
        >
          {topPiece ? (
            <div className="insect" style={{ padding: '20%' }}>
              <Image
                src={`/icons/${topPiece.insectName.toLowerCase()}.svg`}
                unsized
                alt={`${topPiece.insectName}`}
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
