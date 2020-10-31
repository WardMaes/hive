import { HexCoord } from '../lib/hex'
import { Cell as CellType } from '../machines/game'
import Cell from './Cell'

type BoardCoordinate = {
  row: number
  col: number
}

type BoardProps = {
  cells: CellType[]
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
  const maxXCoordinate = cells.reduce(
    (acc, { coord }) => (acc = Math.max(acc, coord.x)),
    -Infinity
  )
  const totalCols = maxXCoordinate - minXCoordinate + 1

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

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${totalCols}, 1fr 2fr) 1fr`,
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
          <div
            className={'cell'}
            style={{
              gridColumnStart,
              gridRowStart,
            }}
            key={`${cell.coord.x}-${cell.coord.y}-${cell.coord.z}`}
          >
            <Cell cell={cell} />
          </div>
        )
      })}
    </div>
  )
}

export default Board
