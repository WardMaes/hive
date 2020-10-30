import { Machine, assign } from 'xstate'

import { Cell } from '../lib/hex'

const startCells: Cell[] = [
  // { x: 1, y: 1, z: -2, occupied: true },
  // { x: 2, y: -1, z: -1, occupied: true },
  // { x: 1, y: 2, z: -3, occupied: true },
  // { x: 0, y: 3, z: -3, occupied: true },
  { x: 0, y: 0, z: 0, occupied: true }, // center
  { x: -1, y: 1, z: 0, occupied: false }, // top left
  // { x: 0, y: 1, z: -1, occupied: true }, // top center
  // { x: 1, y: 0, z: -1, occupied: true }, // top right
  // { x: -1, y: 0, z: 1, occupied: true }, // bottom left
  // { x: 0, y: -1, z: 1, occupied: true }, // bottom center
  // { x: 1, y: -1, z: 0, occupied: true }, // bottom right
]

enum Insect {
  'ant',
  'beetle',
  'queen',
  'grasshopper',
  'spider',
}

interface TurnContext {
  selectedPiece: Cell | null
  cellsPossibleDestinationsCurrentMove: Cell[]
  piecesAllowedToBeMoved: Cell[]
  piecesAllowedToBePlaced: Insect[]
}

interface TurnStateSchema {
  states: {
    initializing: {}
    idle: {}
    selected: {}
    placing: {}
    moving: {}
    finished: {}
  }
}

type TurnEvent =
  | { type: 'SELECT' }
  | { type: 'PLACE' }
  | { type: 'MOVE' }
  | { type: 'UNSELECT' }

interface GameContext {
  cellsPlacedPieces: Cell[]
  currentPlayer: number
  unplacedPiecesPlayer1: Insect[]
  unplacedPiecesPlayer2: Insect[]
}

interface GameEvent {
  type: ''
}

interface GameStateSchema {
  states: {
    initializing: {}
    playing: {}
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

const turnMachine = Machine<TurnContext, TurnStateSchema, TurnEvent>({
  id: 'turn',
  initial: 'initializing',
  context: {
    selectedPiece: null,
    cellsPossibleDestinationsCurrentMove: [],
    // 'piecesAllowedToBeMoved' and 'piecesAllowedToBePlaced' could maybe be merged into 1 property 'piecesAllowedToBePlayed'
    piecesAllowedToBeMoved: [],
    piecesAllowedToBePlaced: [],
  },
  states: {
    initializing: {
      entry: assign({
        // Also includes logic which pieces are allowed to be selected
        // - Won't break the hive
        // - If it is the n-th (don't remember) move and the queen hasn't been placed
        piecesAllowedToBeMoved: (_) => [], // Logic which pieces are allowed to be moved
        piecesAllowedToBePlaced: (_) => [], // Logic which pieces are allowed to be placed
      }),
      always: 'idle',
    },
    idle: {
      // Waiting for player to select a piece on the board, or an unplayed piece
      on: {
        SELECT: {
          target: 'selected',
        },
      },
    },
    selected: {
      // Selecting either an already placed piece to move or a unplayed piece to place
      entry: assign({
        selectedPiece: (_) => null, // Set the clicked piece as selected
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
            selectedPiece: (_) => null,
            cellsPossibleDestinationsCurrentMove: (_) => {
              // Calculate which cells the player can click to place the selectedPiece
              return []
            },
          }),
        },
        UNSELECT: {
          target: 'idle',
          actions: assign({
            selectedPiece: (_) => null,
            // Reset everything (do this in idle state)
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
})

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>({
  id: 'game',
  initial: 'initializing',
  context: {
    cellsPlacedPieces: startCells,
    currentPlayer: 1,
    unplacedPiecesPlayer1: [],
    unplacedPiecesPlayer2: [],
  },
  states: {
    initializing: {
      entry: assign((_) => ({
        // Select start player (propose random, animated in UI as coin flip or something)
        // Set initial pieces for both players
        unplacedPiecesPlayer1: [],
        unplacedPiecesPlayer2: [],
      })),
      always: 'playing',
    },
    playing: {
      invoke: {
        src: turnMachine,
        onDone: {
          // This will be entered when turnMachine enters its final state
          target: 'checkGameFinished',
        },
      },
    },
    checkGameFinished: {
      // Transient transition with conditionals to check whether game is over
      always: [
        {
          target: 'gameOver',
          cond: '' /* Conditional logic to check if queen is surrounded */,
        },
        { target: 'alternating' },
      ],
    },
    alternating: {
      // Transient state that simply changes player turn
      always: {
        actions: assign({
          currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1), // Alternate between players
        }),
        target: 'playing',
      },
    },
    gameOver: {},
  },
})
