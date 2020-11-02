import { Cell } from '../machines/game'
import {
  Move,
  walkPerimeter,
  Axis,
  AxisDirection,
  hexCoordsToLookupTable,
  checkOccupationInLookupTable,
  shiftAlongAxis,
} from '../lib/hex'

export enum InsectName {
  'ant',
  'beetle',
  'queen',
  'grasshopper',
  'spider',
}

export type Insect = {
  name: InsectName
  validMoves: (insectCell: Cell, boardCells: Cell[]) => Move[]
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
    // Filter possible redundant
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
