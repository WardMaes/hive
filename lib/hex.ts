export type Cell = {
  x: number
  y: number
  z: number
}

const hasValidCubeCoordinate = (cell: Cell): Boolean => {
  return cell.x + cell.y + cell.z == 0
}

// Returns the neighbors in clockwise order
const getNeighbours = (cell: Cell): Cell[] => {
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

const haveSameCubeCoordinates = (cellA: Cell, cellB: Cell): Boolean => {
  return cellA.x == cellB.x && cellA.y == cellB.y && cellA.z == cellB.z
}

const uniqueCells = (cells: Cell[]): Cell[] => {
  return cells.filter(
    (cell, i, array) =>
      array.findIndex((a) => haveSameCubeCoordinates(a, cell)) === i
  )
}

const filterOverlap = (cellsA: Cell[], cellsB: Cell[]): Cell[] => {
  return cellsA.filter((cellA) =>
    cellsB.find((cellB) => !haveSameCubeCoordinates(cellA, cellB))
  )
}

export {
  uniqueCells,
  hasValidCubeCoordinate,
  getNeighbours,
  haveSameCubeCoordinates,
  filterOverlap,
}
