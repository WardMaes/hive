import { Cell } from '../../lib/game'
import { InsectName } from '../../lib/insect'

/* 
    Context
*/

export interface TurnContext {
  cellsPossibleDestinationsCurrentMove: Cell[]
  cellsAllowedToMove: Cell[]
  insectsAllowedToPlace: InsectName[]
  selectedUnplayedInsect?: InsectName
  selectedCell?: Cell
  placementCells?: Cell[]
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
