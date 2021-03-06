import React, { useContext } from 'react'
import classNames from 'classnames'
import Image from 'next/image'

import { gameContext } from '../context/machines'

import { Cell as CellType, CellStateEnum } from '../lib/game'

type CellProps = {
  cell: CellType
  gridColumnStart: number
  gridRowStart: number
}

const Cell = ({ cell, gridColumnStart, gridRowStart }: CellProps) => {
  const [gameState, sendToGame] = useContext(gameContext)

  // const selectedCell = gameState.context.selectedCell
  const isSelected = cell.state.includes(CellStateEnum.SELECTED)
  const topPiece = cell.pieces[cell.pieces.length - 1]
  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  const isSelectable = cell.state.includes(CellStateEnum.MOVEABLE)
  const isDestination = cell.state.includes(CellStateEnum.DESTINATION)

  return (
    <div
      className={classNames('cell', {
        selected: isSelected,
        cell__temp: !topPiece,
        selectable: isSelectable,
      })}
      style={{ gridColumnStart, gridRowStart }}
    >
      <div
        className={classNames('cell_content', {
          isSelected: false /* TODO: add cell-occupied as class if selected */,
        })}
        onClick={() =>
          (isSelectable || isDestination) &&
          playerToMove &&
          sendToGame('CELL.SELECT', { cell })
        }
      >
        <div
          className={classNames('cell_clip ', {
            'player-1': topPiece && topPiece.ofPlayer === 1,
            'player-2': topPiece && topPiece.ofPlayer === 2,
          })}
        >
          {topPiece ? (
            <div className="insect">
              <Image
                src={`/icons/${topPiece.insectName.toLowerCase()}.svg`}
                layout="fill"
                objectFit="contain"
                alt={`${topPiece.insectName}`}
                // TODO: fix !important
                className="p-15 !important"
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
