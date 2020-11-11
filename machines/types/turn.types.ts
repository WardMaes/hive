import { Cell } from '../../lib/game'
import { Move } from '../../lib/hex'
import { InsectName } from '../../lib/insect'

/* 
    Context
*/

export interface TurnContext {
  validMoves: Move[]
  cellsAllowedToMove: Cell[]
  insectsAllowedToPlace: InsectName[]
  selectedUnplayedInsect?: InsectName
  selectedCell?: Cell
  // TODO Merge to validDestinaitons and add collection of newly created cells to handle the rest
  placementCells?: Cell[]
  validDestinations: Cell[]
  selectableCells: Cell[]
}

/* 
    Event
*/

export type TurnEvent =
  // | { type: 'MOVE'; move: Move }
  | { type: 'CELL.SELECT'; cell: Cell }
  | { type: 'UNPLAYEDPIECE.SELECT'; insectName: InsectName }
// | { type: 'MOVESELECT'; cell: Cell }
// | { type: 'PLACE'; coord: HexCoord }
// | { type: 'PLACESELECT'; insect: Insect }
// | { type: 'UNSELECT' }
