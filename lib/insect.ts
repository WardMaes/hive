import { REPL_MODE_STRICT } from 'repl'
import {
  Move,
  walkPerimeter,
  Axis,
  AxisDirection,
  hexCoordsToLookupTable,
  checkOccupationInLookupTable,
  shiftAlongAxis,
  getNeighbours,
  haveSameCubeCoordinates,
} from '../lib/hex'
import { Cell } from './game'

export enum InsectName {
  'ant' = 'Ant',
  'beetle' = 'Beetle',
  'queen' = 'Queen Bee',
  'grasshopper' = 'Grasshopper',
  'spider' = 'Spider',
}

export const getInsectByName = (name: InsectName): Insect => {
  switch (name) {
    case InsectName.ant:
      return Ant
    case InsectName.beetle:
      return Beetle
    case InsectName.grasshopper:
      return Grasshopper
    case InsectName.queen:
      return Queen
    default:
      return Spider
  }
}

export type Insect = {
  name: InsectName
  // TODO Currently put level in function but might move to Insect as property
  validMoves: (insectCell: Cell, boardCells: Cell[], level: number) => Move[]
}

export const Spider: Insect = {
  name: InsectName.spider,
  validMoves: (insectCell, boardCells) => {
    return walkPerimeter(
      insectCell.coord,
      boardCells.map((e) => e.coord),
      3
    ).filter((move) => move.length == 3)
  },
}

export const Ant: Insect = {
  name: InsectName.ant,
  validMoves: (insectCell, boardCells) => {
    return walkPerimeter(
      insectCell.coord,
      boardCells.map((e) => e.coord)
    )
  },
}

export const Queen: Insect = {
  name: InsectName.queen,
  validMoves: (insectCell, boardCells) => {
    // Filter possibly redundant
    return walkPerimeter(
      insectCell.coord,
      boardCells.map((e) => e.coord),
      1
    ).filter((move) => move.length == 1)
  },
}

export const Grasshopper: Insect = {
  name: InsectName.grasshopper,
  validMoves: (insectCell, boardCells) => {
    const validMoves: Move[] = []
    const lookUp = hexCoordsToLookupTable(boardCells.map((e) => e.coord))

    Array.from([Axis.X, Axis.Y, Axis.Z]).forEach((axis) => {
      Array.from([AxisDirection.MINUS, AxisDirection.PLUS]).forEach(
        (direction) => {
          let distance = 1
          const directNeighbor = shiftAlongAxis(
            insectCell.coord,
            axis,
            direction,
            distance
          )
          let isOccupied = checkOccupationInLookupTable(directNeighbor, lookUp)
          // Has direct neighbor in specific axis and direction to initiate jump
          if (isOccupied) {
            // Jump over all occupied pieces in specific axis and direction
            let path = [insectCell.coord, directNeighbor]
            while (isOccupied) {
              const neighbor = shiftAlongAxis(
                insectCell.coord,
                axis,
                direction,
                ++distance
              )
              path.push(neighbor)
              isOccupied = checkOccupationInLookupTable(neighbor, lookUp)
            }
            // After encountering a cell that is not occupied, the move is finished
            validMoves.push({
              length: distance,
              destination: path[-1],
              path: path,
            })
          }
        }
      )
    })
    return validMoves
  },
}

export const Beetle: Insect = {
  name: InsectName.beetle,
  validMoves: ({ coord }, boardCells, level = 0) => {
    let moves: Move[] = []
    // Moving on the same level
    if (level == 0) {
      // Bottom level logic
      const level0Moves = walkPerimeter(
        coord,
        boardCells.map((e) => e.coord),
        1
        // Filter possibly redundant
      ).filter((move) => move.length == 1)
      moves = [...moves, ...level0Moves]
    } else {
      // Logic for moving on top of hive
      const occupiedCoordinatesLevelBelow = boardCells
        .filter(({ pieces }) => pieces.length == level - 1)
        .map((cell) => cell.coord)
      const lookUp = hexCoordsToLookupTable<null>(occupiedCoordinatesLevelBelow)
      // TODO extract to lib/hex and allow for any distance (will be handy for mosquito)
      const validDestinations = getNeighbours(coord).filter((neighCoord) =>
        checkOccupationInLookupTable(neighCoord, lookUp)
      )
      const validMoves: Move[] = validDestinations.map(
        (dest) =>
          <Move>{
            destination: dest,
            length: 1,
            path: [coord, dest],
          }
      )
      moves = [...moves, ...validMoves]
    }
    // Logic for either jumping or diving on a neighbor
    const heightLookUp = hexCoordsToLookupTable<number>(
      boardCells.map(({ coord }) => coord),
      boardCells.map(({ pieces }) => pieces.length)
    )
    const neighborsWithHeightDifferenceOfOne = getNeighbours(coord).filter(
      ({ x, y, z }) =>
        checkOccupationInLookupTable({ x, y, z }, heightLookUp) &&
        Math.abs(heightLookUp[x]![y]![z]![0] - level) == 1
    )
    const jumpDiveMoves = neighborsWithHeightDifferenceOfOne.map(
      (destCoord) =>
        <Move>{
          destination: destCoord,
          length: 1,
          path: [coord, destCoord],
        }
    )
    moves = [...moves, ...jumpDiveMoves]
    return moves
  },
}

const isSurrounded = (cell: Cell, allCells: Cell[]): Boolean => {
  const { coord } = cell
  const allCoords = allCells.map((cell) => cell.coord)

  const lookUp = hexCoordsToLookupTable<null>(allCoords)
  const neighbors = getNeighbours(coord)
  return (
    neighbors.filter(
      (neighbor) => !checkOccupationInLookupTable(neighbor, lookUp)
    ).length == 0
  )
}
