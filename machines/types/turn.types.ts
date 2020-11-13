import { Cell } from '../../lib/game'
import { Move } from '../../lib/hex'
import { InsectName } from '../../lib/insect'

/* Schema */

export interface TurnStateSchema {
  initial: 'selecting'
  states: {
    selecting: {}
    selectedToPlace: {}
    selectedToMove: {}
    placing: {}
    moving: {}
    finish: {}
  }
}

/* Context */

export interface TurnContext {
  selectableCells: Cell[]
  validMoves?: Move[]
  cellsAllowedToMove?: Cell[]
  insectsAllowedToPlace?: InsectName[]
  selectedUnplayedInsect?: InsectName
  selectedCell?: Cell
  // TODO Merge to validDestinaitons and add collection of newly created cells to handle the rest
  placementCells?: Cell[]
  validDestinations?: Cell[]
  tempCells?: Cell[]
}

/* Event */

export type TurnEvent =
  | { type: 'CELL.SELECT'; cell: Cell }
  | { type: 'UNPLAYEDPIECE.SELECT'; insectName: InsectName }

/* 
  State
*/
// TODO maybe later
// export type TurnState =
// | {
//   value: 'playing.selecting'
//   context: TurnContext & {
//     cellsAllowedToMove: Cell[]
//     insectsAllowedToPlace: InsectName[]
//   }
// }
// | {
//   value: 'playing.selectedToPlace'
//   context: {
//     selectedUnplayedInsect: InsectName;
//     validDestinations: Cell[]
//   }
// }
// | {
//   value: 'playing.selectedToMove'
//   context: {
//     selectedCell: Cell;
//     validDestinations: Cell[];
//   }
// }
