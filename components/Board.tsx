type Cell = {
  x: number
  y: number
  z: number
}

export type BoardType = {
  cells: Cell[]
}

type BoardProps = {
  board: BoardType
}

const Board = ({ board }: BoardProps) => {
  return (
    <div className="grid">
      {board.cells.map((cell) => (
        <div className={'x:' + cell.x + ' y:' + cell.y + ' z:' + cell.z}>
          {JSON.stringify(cell, null, 2)}
        </div>
      ))}
    </div>
  )
}

export default Board
