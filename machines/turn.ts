import { assign } from 'xstate'
import { Insect, Cell } from './game'

export interface TurnContext {
  selectedPiece: Cell | null
  cellsPossibleDestinationsCurrentMove: Cell[]
  piecesAllowedToBeMoved: Cell[]
  piecesAllowedToBePlaced: Insect[]
}

export interface TurnStateSchema {
  initial: 'initializing'
  states: {
    initializing: {}
    selecting: {}
    placing: {}
    moving: {}
    finished: {}
  }
}

export type TurnEvent =
  | { type: 'SELECT'; cell: Cell }
  | { type: 'PLACE' }
  | { type: 'MOVE' }
  | { type: 'UNSELECT' }

export const turnMachine: TurnStateSchema = {
  initial: 'initializing',
  states: {
    initializing: {
      entry: assign({
        // Also includes logic which pieces are allowed to be selected
        // - Won't break the hive
        // - If it is the n-th (don't remember) move and the queen hasn't been placed
        piecesAllowedToBeMoved: (_) => [], // Logic which pieces are allowed to be moved
        piecesAllowedToBePlaced: (_) => [], // Logic which pieces are allowed to be placed
      }),
      always: 'selecting',
    },
    selecting: {
      // Selecting either an already placed piece to move or a unplayed piece to place
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (_) => {
          // Calculate which cells the player can click to place the selectedPiece
          return []
        },
      }),
      on: {
        // Dont know if it is possible to add identifier selected piece to the event but that would be the goal
        // That or listener that links to function that sets the context
        PLACE: { target: 'placing' },
        MOVE: { target: 'moving' },
        // Player selects a different piece
        SELECT: {
          actions: assign({
            selectedPiece: (_, event: { type: 'SELECT'; cell: Cell }) =>
              event.cell,
            cellsPossibleDestinationsCurrentMove: (_) => {
              // Calculate which cells the player can click to place the selectedPiece
              return []
            },
          }),
        },
        UNSELECT: {
          actions: assign({
            // Reset stuff
            selectedPiece: (_) => null,
            cellsPossibleDestinationsCurrentMove: (_) => {
              // Calculate which cells the player can click to place the selectedPiece
              return []
            },
          }),
        },
      },
    },
    // 'placing' and 'moving' states might possibly be merged into 1 state called 'playing'
    placing: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (_) => [], // Reset possible destinations (not sure if needed)
      }),
      after: {
        // After a 1s animation, go to finished state
        1000: 'finished',
      },
    },
    moving: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (_) => [], // Reset possible destinations (not sure if needed)
      }),
      after: {
        // After a 1s animation, go to finished state
        1000: 'finished',
      },
    },
    finished: {
      // Transitive state to finish turn and to return to game machine
      type: 'final', // This will notify parent machine the current turn is over
    },
  },
}
