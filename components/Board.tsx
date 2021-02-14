import { HexCoord } from '../lib/hex'
import { Cell as CellType } from '../lib/game'

import { Cell } from './index'

type BoardCoordinate = {
  row: number
  col: number
}

type BoardProps = {
  cells: CellType[]
  // selectableCells: CellType[]
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

const Board = ({ cells }: BoardProps) => {
  // Calculating properties to calculate size of board as a grid and to map coordinates
  const minXCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.min(acc, coord.x)),
    +Infinity
  )
  const minYZCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.min(acc, -(coord.y - coord.z))),
    +Infinity
  )
  const maxYZCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.max(acc, -(coord.y - coord.z))),
    -Infinity
  )
  const maxXCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.max(acc, coord.x)),
    -Infinity
  )
  const totalCols = maxXCoordinate - minXCoordinate + 1
  const totalRows = maxYZCoordinate - minYZCoordinate + 1

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  const yUnit = screenWidth < screenHeight ? totalCols : totalRows
  const unit = Math.min(screenWidth, screenHeight) / ((yUnit + 24) * 3)
  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${totalCols}, ${unit}px ${2 * unit}px) ${unit}px`,
      }}
    >
      {cells.map((cell) => {
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
    </div>
  )
}

export default Board
