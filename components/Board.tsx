import { Cell as CellType } from './../lib/hex'
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
    (acc, current) => (acc = Math.min(acc, current.x)),
    +Infinity
  )
  const minYZCoordinate = cells.reduce(
    (acc, current) => (acc = Math.min(acc, -(current.y - current.z))),
    +Infinity
  )
  const maxXCoordinate = cells.reduce(
    (acc, current) => (acc = Math.max(acc, current.x)),
    -Infinity
  )
  // const maxYZCoordinate = cells.reduce((acc, current) => acc = Math.max(acc, -(current.y - current.z)), -Infinity)
  const totalCols = maxXCoordinate - minXCoordinate + 1
  // const totalRows = maxYZCoordinate - minYZCoordinate + 1

  const convertCellToGridLocation = (
    cell: CellType,
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
          cell,
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
            key={`${cell.x}-${cell.y}-${cell.z}`}
          >
            <Cell cell={cell} />
          </div>
        )
      })}
    </div>
  )
}

export default Board
