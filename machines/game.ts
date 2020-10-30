import { Machine, assign, spawn } from 'xstate'

import { Cell } from '../lib/hex'
import { createCellMachine } from './cell'

// TODO: update ref typing
interface CellAndRef extends Cell {
  ref?: any
}

// The hierarchical (recursive) schema for the states
interface GameStateSchema {
  states: {
    initial: {}
    ready: {}
  }
}

// The events that the machine handles
type GameEvent = { type: 'CELL.SELECT'; cell: Cell }

// The context (extended state) of the machine
interface GameContext {
  cells: CellAndRef[]
}

const initialContext: GameContext = {
  cells: [
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
  ],
}

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>({
  id: 'game',
  initial: 'initial',
  context: initialContext,
  states: {
    initial: {
      entry: assign({
        cells: (context) => {
          // "Rehydrate" persisted cells
          return context.cells.map((cell) => ({
            ...cell,
            ref: spawn(createCellMachine(cell)),
          }))
        },
      }),
      always: 'ready',
    },
    ready: {},
  },
  on: {
    'CELL.SELECT': {
      actions: (context, event) => {
        // TODO: use correct comparison function from lib here
        const cell = context.cells.find(
          (c) =>
            c.x === event.cell.x && c.y === event.cell.y && c.z === event.cell.z
        )
        if (!cell) {
          return
        }
        cell.ref.send('SELECT')
      },
    },
  },
})

const turnMachine = Machine({
  id: 'turn',
  initial: 'initializing',
  context: {
    selectedPiece: {},
    cellsPossibleDestinationsCurrentMove: [],
    // 'piecesAllowedToBeMoved' and 'piecesAllowedToBePlaced' could maybe be merged into 1 property 'piecesAllowedToBePlayed'
    piecesAllowedToBeMoved: [],
    piecesAllowedToBePlaced: [],
  },
  states: {
    initializing: {
      entry: assign({
        piecesAllowedToBeMoved: (context) => [], // Logic which pieces are allowed to be moved
        piecesAllowedToBePlaced: (context) => [], // Logic which pieces are allowed to be placed
      }),
      always: 'idle',
    },
    idle: {
      // Waiting for player to select a piece on the board, or an unplayed piece
      // Also includes logic which pieces are allowed to be selected
      // - Won't break the hive
      // - If it is the n-th (don't remember) move and the queen hasn't been placed
      on: {
        SELECT: {
          target: 'selected',
          cond: 'queen rule + doesnt break hive',
        },
      },
    },
    selected: {
      // Selecting either an already placed piece to move or a unplayed piece to place
      entry: assign({
        selectedPiece: (context, event) => {}, // Set the clicked piece as selected
        cellsPossibleDestinationsCurrentMove: (context) => {
          // Calculate which cells the player can click to place the selectedPiece
        },
      }),
      on: {
        // Dont know if it is possible to add identifier selected piece to the event but that would be the goal
        // That or listener that links to function that sets the context
        PLACE: { target: 'placing', cond: 'player clicked a valid cell' },
        MOVE: { target: 'moving', cond: 'player clicked a valid cell' },
        // Player selects a different piece
        SELECT: {
          actions: assign({ selectedPiece: (context, event) => {} }),
          cond: 'queen rule + doesnt breake hive',
        },
      },
    },
    // 'placing' and 'moving' states might possibly be merged into 1 state called 'playing'
    placing: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (context) => null, // Reset possible destinations (not sure if needed)
      }),
      after: {
        // After a 1s animation, go to finished state
        1000: 'finished',
      },
    },
    moving: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (context) => null, // Reset possible destinations (not sure if needed)
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

const differentGameMachine = Machine({
  id: 'game',
  initial: 'initializing',
  context: {
    cellsPlacedPieces: [],
    currentPlayer: 1,
    unplacedPiecesPlayer1: [],
    unplacedPiecesPlayer2: [],
  },
  states: {
    initializing: {
      entry: assign((context) => {
        // Select start player (propose random, animated in UI as coin flip or something)
        // Set initial pieces for both players
      }),
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
        { target: 'changeTurn' },
      ],
    },
    changeTurn: {
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
