export type Cell = {
  x: number
  y: number
  z: number
}

// TODO Handy function that needs to be used but moved to more appropriate place
const cellHasValidCubeCoordinate = (cell: Cell): Boolean => {
  return cell.x + cell.y + cell.z == 0
}

const calculateNeighborsCell = (cell: Cell): Cell[] => {
  // Returns the neighbors in clockwise order
  return [
    // Note that these directions only apply in flat configuration
    { x: cell.x, y: cell.y + 1, z: cell.z - 1 }, // Top
    { x: cell.x + 1, y: cell.y, z: cell.z - 1 }, // Right-top
    { x: cell.x + 1, y: cell.y - 1, z: cell.z }, // Right-bottom
    { x: cell.x, y: cell.y - 1, z: cell.z + 1 }, // Bottom
    { x: cell.x - 1, y: cell.y, z: cell.z + 1 }, // Left-bottom
    { x: cell.x - 1, y: cell.y + 1, z: cell.z }, // Left-top
  ]
}

const cellsHaveIdentialCubeCoordinates = (cellA: Cell, cellB: Cell) => {
  return cellA.x == cellB.x && cellA.y == cellB.y && cellA.z == cellB.z
}

const filterUnoccupiedCells = (
  cells: Cell[],
  occupiedCells: Cell[]
): Cell[] => {
  // Better rewritten as while or something even more performant (but probably doesnt even matter for performance)
  return cells.filter((cell) =>
    occupiedCells.reduce(
      (acc: Boolean, current: Cell) =>
        (acc = !acc ? cellsHaveIdentialCubeCoordinates(cell, current) : acc),
      false
    )
  )
}

const filterOccupiedCells = (cells: Cell[], occupiedCells: Cell[]): Cell[] => {
  return cells.filter((cell) =>
    occupiedCells.reduce(
      (acc: Boolean, current: Cell) =>
        (acc = !acc ? cellsHaveIdentialCubeCoordinates(cell, current) : acc),
      false
    )
  )
}

export {
  cellHasValidCubeCoordinate,
  calculateNeighborsCell,
  cellsHaveIdentialCubeCoordinates,
  filterUnoccupiedCells,
  filterOccupiedCells,
}
