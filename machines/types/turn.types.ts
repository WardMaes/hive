import { Cell, Piece } from '../../lib/game'
import { Insect } from '../../lib/insect'
import { HexCoord, Move } from '../../lib/hex'

/* 
    Context
*/

export interface TurnContext {
  cellsPossibleDestinationsCurrentMove?: Cell[]
  cellsAllowedToMove?: Cell[]
  insectsAllowedToPlace?: Insect[]
  placementCoord?: HexCoord
  selectedPiece?: Cell
  selectedToPlace?: Insect
  validPlacementCoords?: HexCoord[]
}

/* 
    Event
*/

export type TurnEvent =
  // | { type: 'MOVE'; move: Move }
  | { type: 'CELL.CLICK'; cell: Cell }
  | { type: 'UNPLAYEDPIECE.CLICK'; piece: Piece }
// | { type: 'MOVESELECT'; cell: Cell }
// | { type: 'PLACE'; coord: HexCoord }
// | { type: 'PLACESELECT'; insect: Insect }
// | { type: 'UNSELECT' }
