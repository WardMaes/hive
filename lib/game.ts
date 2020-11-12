import {
  HexCoord,
  Move,
  checkOccupationInLookupTable,
  getArticulationPointsHexCoordinates,
  getNeighbours,
  hexCoordsToLookupTable,
  haveSameCubeCoordinates,
  uniqueCoordinates,
} from './hex'
// import { getInsectByName, InsectName, Insect, Queen } from './insect'
import { getInsectByName, InsectName } from './insect'

export type Board = {
  cells: Cell[]
}

export enum CellStateEnum {
  MOVEABLE = 'moveable',
  SELECTED = 'selected',
  TEMPORARY = 'temporary',
  DESTINATION = 'destination',
  // TODO either add state which sets path of move or add list to cell with moves of which the cell is a part of the path and do logic in frontend
  // PARTOFPATH,
}

export type Cell = {
  coord: HexCoord
  // Convention is the higher the index of the piece in the array, the higher it is in the stack
  pieces: Piece[]
  state: CellStateEnum[]
}
export type Piece = {
  ofPlayer: number
  // insect: Insect
  insectName: InsectName
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

/* 
  General
*/

export const addCellStates = (states: CellStateEnum[], cell: Cell): Cell => {
  states.forEach((state) => {
    if (!cell.state.includes(state)) {
      cell.state = [...cell.state, state]
    }
  })
  return cell
}

export const removeCellStates = (states: CellStateEnum[], cell: Cell): Cell => {
  const refCell: Cell = {
    ...cell,
  }
  refCell.state = cell.state.filter((state) => !states.includes(state))
  return refCell
}

export const removeCellStatesFromCells = (
  states: CellStateEnum[],
  cells: Cell[]
): Cell[] => {
  const x = cells.map((cell) => removeCellStates(states, cell))
  return x
}

export const filterEmptyCells = (cells: Cell[]): Cell[] => {
  return cells.filter((cell) => cell.pieces.length > 0)
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
        insectName: insectName,
        // insect: getInsectByName(insectName),
        ofPlayer: player,
      },
    ],
    state: [],
  }
}

// Returns empty cells for each coordinate that was present in other cells
export const createTempEmptyCellsForMissingCoords = (
  hexCoordinates: HexCoord[],
  presentCells: Cell[]
): Cell[] => {
  const missingCoords = hexCoordinates.filter(
    (coord) =>
      presentCells.findIndex((cell) =>
        haveSameCubeCoordinates(cell.coord, coord)
      ) === -1
  )
  return missingCoords.map((coord) => createTempEmptyCell(coord))
}

export const createTempEmptyCell = (hexCoord: HexCoord): Cell => {
  return {
    coord: hexCoord,
    pieces: [],
    state: [],
  }
}

export const getTopPieceOfCell = ({ pieces }: Cell): Piece | null => {
  if (pieces.length) {
    return pieces[pieces.length - 1]
  }
  return null
}

/* 
  Game specific
*/

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
      return (
        pieces.findIndex((piece) => piece.insectName === InsectName.queen) != -1
      )
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

/* 
  TURN SPECIFIC
*/

/* 
  Placing
*/

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

/* 
  Moving
*/

export const getValidMovesForCell = (
  cell: Cell,
  boardCells: Cell[]
): Move[] => {
  const insectName = getTopPieceOfCell(cell)?.insectName
  if (insectName) {
    return getInsectByName(insectName).validMoves(cell, boardCells)
  }
  return []
}

export const getValidCellsToMove = (
  currentPlayer: number,
  playerHand: PlayerHand,
  boardCells: Cell[]
): Cell[] => {
  const playersQueenNotPlayed =
    playerHand.get(InsectName.queen) && playerHand.get(InsectName.queen)! > 0
  // console.log('Queen been placed', playersQueenNotPlayed, playerHand)
  if (!playersQueenNotPlayed) {
    const cellsControlledByPlayer = getCellsControlledByPlayer(
      boardCells,
      currentPlayer
    )
    const articulationPointCoords = getArticulationPointsHexCoordinates(
      boardCells.map((cell) => cell.coord)
    )
    const validToMove = cellsControlledByPlayer.filter((cell) => {
      const heightTopPiece = cell.pieces.length - 1
      if (heightTopPiece >= 0) {
        if (
          articulationPointCoords.findIndex((artCoord) =>
            haveSameCubeCoordinates(artCoord, cell.coord)
          ) === -1
        ) {
          // TODO intuition says unneccesary but maybe generate moves to check if moves are available for piece
          // Examples: Surrounded cells, diamond-shaped hole in hive with spider in one of them
          return true
        }
      }
      return false
    })
    return validToMove
  }
  return []
}

/* 
  PRIVATE HELPERS
*/

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

const getControllingPlayerOfCell = (cell: Cell): number | undefined => {
  return getTopPieceOfCell(cell)?.ofPlayer
}
