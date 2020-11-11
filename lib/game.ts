// import { Cell } from '../machines/game'
import {
  checkOccupationInLookupTable,
  getNeighbours,
  HexCoord,
  hexCoordsToLookupTable,
  haveSameCubeCoordinates,
  uniqueCoordinates,
} from './hex'
import { getInsectByName, InsectName, Insect, Queen } from './insect'

export type Board = {
  cells: Cell[]
}
export type Cell = {
  coord: HexCoord
  // Convention is the higher the index of the piece in the array, the higher it is in the stack
  pieces: Piece[]
}
export type Piece = {
  ofPlayer: number
  insect: Insect
}
export type PlayerHand = Map<InsectName, number>
export type GameConfig = {
  expansions: GameExpansion[]
}
export enum GameExpansion {}

const insectsForExpansion = {
  base: [
    { insect: InsectName.ant, count: 3 },
    { insect: InsectName.beetle, count: 2 },
    { insect: InsectName.grasshopper, count: 3 },
    { insect: InsectName.queen, count: 1 },
    { insect: InsectName.spider, count: 2 },
  ],
}

export const getStartInsectsPlayer = (): PlayerHand => {
  let insects: Map<InsectName, number> = new Map()
  // Base game
  insectsForExpansion.base.forEach(({ insect, count }) => {
    insects.set(insect, count)
  })
  return insects
}

export const isGameOver = (boardCells: Cell[]): boolean => {
  // Find queens
  const queenCoords = boardCells
    .filter(({ pieces }) => {
      return pieces.findIndex((piece) => piece.insect === Queen) != -1
    })
    .map(({ coord }) => coord)
  const lookUp = hexCoordsToLookupTable(boardCells.map((cell) => cell.coord))
  // Check if all neighbors of any queen are all occupied
  return queenCoords.some((queenCord) =>
    getNeighbours(queenCord).every((neighCoord) =>
      checkOccupationInLookupTable(neighCoord, lookUp)
    )
  )
}

export const createCellWithInsect = (
  hexCoord: HexCoord,
  insectName: InsectName,
  player: number
): Cell => {
  return {
    coord: hexCoord,
    pieces: [
      {
        insect: getInsectByName(insectName),
        ofPlayer: player,
      },
    ],
  }
}

export const removeInsectFromUnplayed = (
  unplayedInsectsOfPlayer: PlayerHand,
  insectName: InsectName
): PlayerHand => {
  const copy = new Map(unplayedInsectsOfPlayer)
  const currentCount = copy.get(insectName)
  if (currentCount && currentCount > 0) {
    copy.set(insectName, currentCount - 1)
  } else {
    // TODO throw error since removing this an insect of this type was no longer possible
  }
  return copy
}

export const filterValidInsectsToPlace = (
  unplacedInsects: PlayerHand,
  turn: number
): InsectName[] => {
  // If turn 4 and queen still hasnt been placed
  if (
    turn >= 4 &&
    unplacedInsects.get(InsectName.queen) &&
    unplacedInsects.get(InsectName.queen)! >= 1
  ) {
    return [InsectName.queen]
  } else {
    const insectNames: InsectName[] = []
    unplacedInsects.forEach((_, insectName) => {
      insectNames.push(insectName)
    })
    return insectNames
  }
}

export const getValidPlacementCoordinates = (
  boardCells: Cell[],
  player: number
): HexCoord[] => {
  // If board is empty, allow center hex
  if (boardCells.length === 0) {
    return [{ x: 0, y: 0, z: 0 }]
  }
  // If only one other piece has been placed (by the other player), allow opponent adjanceny
  if (boardCells.length === 1) {
    const placedCellCoord = boardCells[0].coord
    return getNeighbours(placedCellCoord)
  }
  // In all other cases, find neigbors of cells controlled by player that dont share an edge with an opponent controlled cell
  const validCoords: HexCoord[] = []
  getCellsControlledByPlayer(boardCells, player).forEach((cell) => {
    const occupiedNeighborCoords = getOccupiedNeighborCellsOfCoord(
      boardCells,
      cell.coord
    ).map((cell) => cell.coord)
    const unOccupiedNeighborCoords = getNeighbours(cell.coord).filter(
      (neighCoord) =>
        occupiedNeighborCoords.findIndex((occNeighCoor) =>
          haveSameCubeCoordinates(occNeighCoor, neighCoord)
        ) == -1
    )
    unOccupiedNeighborCoords.forEach((unOccNeighCoord) => {
      const bordersCellControlledByOpp = getOccupiedNeighborCellsOfCoord(
        boardCells,
        unOccNeighCoord
      ).some((cell) => getControllingPlayerOfCell(cell) !== player)
      if (!bordersCellControlledByOpp) {
        validCoords.push(unOccNeighCoord)
      }
    })
  })
  return uniqueCoordinates(validCoords)
}

export const createTempEmptyCell = (hexCoord: HexCoord): Cell => {
  return {
    coord: hexCoord,
    pieces: [],
  }
}

const getCellsControlledByPlayer = (
  boardCells: Cell[],
  player: number
): Cell[] => {
  return boardCells.filter(
    (cell) => getControllingPlayerOfCell(cell) === player
  )
}

const getOccupiedNeighborCellsOfCoord = (
  boardCells: Cell[],
  coord: HexCoord
): Cell[] => {
  const neighbors = getNeighbours(coord)
  return boardCells.filter(
    ({ coord }) =>
      neighbors.findIndex((neighCoord) =>
        haveSameCubeCoordinates(neighCoord, coord)
      ) !== -1
  )
}

const getControllingPlayerOfCell = ({ pieces }: Cell): number => {
  return pieces[pieces.length - 1].ofPlayer
}

// // TODO Check if moving piece on top would break the hive (only one on the stack + articulation point check)
// const movementWouldBreakHive = (cell: Cell): Boolean => {
//   // Can only be broken if it is the bottom level
//   // if (cell.pieces.length > 1) {
//   //   return false
//   // } else {
//   //   const articPoints = getArticulationPointsHexCoordinates(
//   //     this.boardCells.map((cell) => cell.coord)
//   //   )
//   //   return
//   // }
//   return true
// }

// const getValidCellsToMove = (currentPlayer: number): Cell[] => {
//   // // Check if queen has been placed
//   // const playersQueenBeenPlaced =
//   //   (currentPlayer === 1
//   //     ? this.unplayedInsectsPlayer1
//   //     : this.unplayedInsectsPlayer2
//   //   ).findIndex((insect) => insect === Queen) === -1
//   // if (playersQueenBeenPlaced) {
//   //   // Get all cells which have a piece of current player on top
//   //   const cellsWithPieceOfPlayerOnTop = this.boardCells.filter(
//   //     ({ pieces }) => pieces[pieces.length - 1].ofPlayer === currentPlayer
//   //   )
//   //   const dontBreakHive =
//   // }
//   // return []
//   return []
// }
