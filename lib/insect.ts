import { Cell } from '../machines/game'
import { Move, walkPerimeter } from "../lib/hex"

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
        return walkPerimeter(insectCell.coord, boardCells.map((e) => e.coord), 3).filter((move) => move.length == 3)
    }
}

export const Ant: Insect = {
    name: InsectName.ant,
    validMoves: (insectCell, boardCells) => {
        return walkPerimeter(insectCell.coord, boardCells.map((e) => e.coord))
    }
}

export const Queen: Insect = {
    name: InsectName.queen,
    validMoves: (insectCell, boardCells) => {
        // Filter possible redundant
        return walkPerimeter(insectCell.coord, boardCells.map((e) => e.coord), 1).filter((move) => move.length == 1)
    }
}

