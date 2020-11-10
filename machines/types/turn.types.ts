import { Cell } from '../../lib/game'
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
  | { type: 'MOVE'; move: Move }
  | { type: 'MOVESELECT'; cell: Cell }
  | { type: 'PLACE'; coord: HexCoord }
  | { type: 'PLACESELECT'; insect: Insect }
  | { type: 'UNSELECT' }
