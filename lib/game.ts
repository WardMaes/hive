// import { Cell } from '../machines/game'
import {
  checkOccupationInLookupTable,
  getNeighbours,
  HexCoord,
  hexCoordsToLookupTable,
  getArticulationPointsHexCoordinates,
  haveSameCubeCoordinates,
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

export enum GameExpansion {}

export type GameConfig = {
  expansions: GameExpansion[]
}

const insectsForExpansion = {
  base: [
    { insect: InsectName.ant, count: 3 },
    { insect: InsectName.beetle, count: 2 },
    { insect: InsectName.grasshopper, count: 3 },
    { insect: InsectName.queen, count: 1 },
    { insect: InsectName.spider, count: 2 },
  ],
}

export class Game {
  // Consider moving these to the context of the machine

  unplayedInsectsPlayer1: Map<InsectName, number>
  unplayedInsectsPlayer2: Map<InsectName, number>
  boardCells: Cell[]

  constructor(config: GameConfig) {
    this.unplayedInsectsPlayer1 = this.#getStarterInsectsPlayer(
      config.expansions
    )
    this.unplayedInsectsPlayer2 = this.#getStarterInsectsPlayer(
      config.expansions
    )
    this.boardCells = []
  }

  isGameOver = (): boolean => {
    // Find queens
    const queenCoords = this.boardCells
      .filter(({ pieces }) => {
        return pieces.findIndex((piece) => piece.insect === Queen) != -1
      })
      .map(({ coord }) => coord)
    const lookUp = hexCoordsToLookupTable(
      this.boardCells.map((cell) => cell.coord)
    )
    // Check if all neighbors of any queen are all occupied
    return queenCoords.some((queenCord) =>
      getNeighbours(queenCord).every((neighCoord) =>
        checkOccupationInLookupTable(neighCoord, lookUp)
      )
    )
  }

  placeInsect = (insect: Insect, hexCoord: HexCoord, player: number) => {
    // Place the insect in as a new piece on a new cell
    this.boardCells.push({
      coord: hexCoord,
      pieces: [
        {
          insect: insect,
          ofPlayer: player,
        },
      ],
    })
    // Remove the insect from the player his hand
    let currentHand =
      player === 1 ? this.unplayedInsectsPlayer1 : this.unplayedInsectsPlayer2
    const currentCount = currentHand.get(insect.name)!
    if (currentCount > 1) {
      currentHand.set(insect.name, currentCount - 1)
    } else {
      currentHand.delete(insect.name)
    }
  }

  getUnplayedInsectsPlayer = (player: number): Insect[] => {
    const insectArray = []
    const unplayedMap = this.#getUnplayedInsectsMapOfPlayer(player)
    for (let [insectName, count] of unplayedMap) {
      for (let index = 0; index < count; index++) {
        insectArray.push(getInsectByName(insectName))
      }
    }
    return insectArray
  }

  getValidCellsToMove = (currentPlayer: number): Cell[] => {
    // // Check if queen has been placed
    // const playersQueenBeenPlaced =
    //   (currentPlayer === 1
    //     ? this.unplayedInsectsPlayer1
    //     : this.unplayedInsectsPlayer2
    //   ).findIndex((insect) => insect === Queen) === -1
    // if (playersQueenBeenPlaced) {
    //   // Get all cells which have a piece of current player on top
    //   const cellsWithPieceOfPlayerOnTop = this.boardCells.filter(
    //     ({ pieces }) => pieces[pieces.length - 1].ofPlayer === currentPlayer
    //   )
    //   const dontBreakHive =
    // }
    // return []
    return []
  }

  // TODO dont like passing these like this, maybe collect parameters that machine keeps in gameState and pass that
  getValidInsectsToPlace = (player: number, turn: number): Insect[] => {
    if (
      turn >= 4 &&
      this.#getUnplayedInsectsMapOfPlayer(player).get(InsectName.queen) &&
      this.#getUnplayedInsectsMapOfPlayer(player).get(InsectName.queen)! > 1
    ) {
      return [getInsectByName(InsectName.queen)]
    } else {
      return this.getUnplayedInsectsPlayer(player)
    }
  }

  getValidPlacementCoordinates = (player: number): HexCoord[] => {
    // If board is empty, allow center hex
    if (this.boardCells.length === 0) {
      return [{ x: 0, y: 0, z: 0 }]
    }
    // If only one other piece has been placed (by the other player), allow opponent adjanceny
    if (this.boardCells.length === 1) {
      const placedCellCoord = this.boardCells[0].coord
      return getNeighbours(placedCellCoord)
    }
    // In all other cases, find neigbors of cells controlled by player that dont share an edge with an opponent controlled cell
    const validCoords: HexCoord[] = []
    this.#getCellsControlledByPlayer(player).forEach((cell) => {
      const occupiedNeighborCoords = this.#getOccupiedNeighborCellsOfCoord(
        cell.coord
      ).map((cell) => cell.coord)
      const unOccupiedNeighborCoords = getNeighbours(cell.coord).filter(
        (neighCoord) =>
          occupiedNeighborCoords.findIndex((occNeighCoor) =>
            haveSameCubeCoordinates(occNeighCoor, neighCoord)
          ) == -1
      )
      unOccupiedNeighborCoords.forEach((unOccNeighCoord) => {
        const bordersCellControlledByOpp = this.#getOccupiedNeighborCellsOfCoord(
          unOccNeighCoord
        ).some((cell) => this.#getControllingPlayerOfCell(cell) !== player)
        if (!bordersCellControlledByOpp) {
          validCoords.push(unOccNeighCoord)
        }
      })
    })
    return validCoords
  }

  // TODO Check if moving piece on top would break the hive (only one on the stack + articulation point check)
  movementWouldBreakHive = (cell: Cell): Boolean => {
    // Can only be broken if it is the bottom level
    // if (cell.pieces.length > 1) {
    //   return false
    // } else {
    //   const articPoints = getArticulationPointsHexCoordinates(
    //     this.boardCells.map((cell) => cell.coord)
    //   )
    //   return
    // }
    return true
  }

  #getUnplayedInsectsMapOfPlayer = (player: number) => {
    return player === 1
      ? this.unplayedInsectsPlayer1
      : this.unplayedInsectsPlayer2
  }

  #getControllingPlayerOfCell = ({ pieces }: Cell): number => {
    return pieces[pieces.length - 1].ofPlayer
  }

  #getCellsControlledByPlayer = (player: number): Cell[] => {
    return this.boardCells.filter(
      (cell) => this.#getControllingPlayerOfCell(cell) === player
    )
  }

  #getOccupiedNeighborCellsOfCoord = (coord: HexCoord): Cell[] => {
    const neighbors = getNeighbours(coord)
    return this.boardCells.filter(
      ({ coord }) =>
        neighbors.findIndex((neighCoord) =>
          haveSameCubeCoordinates(neighCoord, coord)
        ) !== -1
    )
  }

  #getStarterInsectsPlayer = (
    expansions: GameExpansion[]
  ): Map<InsectName, number> => {
    let insects: Map<InsectName, number> = new Map()
    // Base game
    insectsForExpansion.base.forEach(({ insect, count }) => {
      insects.set(insect, count)
    })
    return insects
  }
}
