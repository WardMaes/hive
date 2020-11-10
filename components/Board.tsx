import { HexCoord } from '../lib/hex'
import { Cell as CellType } from '../lib/game'
import Cell from './Cell'
import { useContext } from 'react'
import { gameContext } from '../context/machines'

type BoardCoordinate = {
  row: number
  col: number
}

type BoardProps = {
  cells: CellType[]
}

const convertCellToGridLocation = (
  cell: HexCoord,
  minXCoordinate: number,
  minYZCoordinate: number
): BoardCoordinate => {
  return {
    row: -(cell.y - cell.z) - minYZCoordinate,
    col: cell.x - minXCoordinate,
  }
}

const Board = () => {
  const [state, send] = useContext(gameContext)
  const occupiedCells = state.context.cellsOnBoard!
  const isPlacing = state.matches({ playing: 'prepareToPlace' })
  const placeDestinationCells: CellType[] = isPlacing
    ? state.context.validPlacementCoords!.map((hexCoord) => {
        return {
          coord: hexCoord,
          pieces: [],
        }
      })
    : []
  const cells = [...occupiedCells, ...placeDestinationCells]

  // Calculating properties to calculate size of board as a grid and to map coordinates
  const minXCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.min(acc, coord.x)),
    +Infinity
  )
  const minYZCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.min(acc, -(coord.y - coord.z))),
    +Infinity
  )
  const maxXCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.max(acc, coord.x)),
    -Infinity
  )
  const totalCols = maxXCoordinate - minXCoordinate + 1

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${totalCols}, 1fr 2fr) 1fr`,
      }}
    >
      {occupiedCells.map((cell) => {
        const { row, col } = convertCellToGridLocation(
          cell.coord,
          minXCoordinate,
          minYZCoordinate
        )
        const gridColumnStart = 1 + col * 2
        const gridRowStart = row + 1

        return (
          <Cell
            cell={cell}
            key={`${cell.coord.x}-${cell.coord.y}-${cell.coord.z}`}
            gridColumnStart={gridColumnStart}
            gridRowStart={gridRowStart}
          />
        )
      })}
      {(() => {
        if (isPlacing) {
          return placeDestinationCells.map((cell) => {
            const { row, col } = convertCellToGridLocation(
              cell.coord,
              minXCoordinate,
              minYZCoordinate
            )
            const gridColumnStart = 1 + col * 2
            const gridRowStart = row + 1

            return (
              <Cell
                cell={cell}
                key={`${cell.coord.x}-${cell.coord.y}-${cell.coord.z}`}
                gridColumnStart={gridColumnStart}
                gridRowStart={gridRowStart}
              />
            )
          })
        }
      })()}
    </div>
  )
}

export default Board
