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
  key: 'game',
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
  key: 'turn',
  initial: '',
  context: {
    cellsPossibleDestinationsCurrentMove: [],
  },
  states: {
    select: {
      // Selecting either an already placed piece to move or a unplayed piece to place
      entry: assign({
        // Also includes logic which pieces are allowed to be selected
        // - Won't break the hive
        // - If it is the n-th (don't remember) move and the queen hasn't been placed
        piecesAllowedToBePlaced: (context) => {
          null
        },
        piecesAllowedToBeMoved: (context) => {
          null
        },
      }),
      on: {
        // Dont know if it is possible to add identifier selected piece to the event but that would be the goal
        // That or listener that links to function that sets the context
        PLACE: 'place',
        MOVE: 'move',
      },
    },
    place: {
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (context) => {},
      }),
    },
    move: {
      // Calculate possible valid destinations of piece
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (context) => {},
      }),
      on: {
        //
        DESTINATION_CHOSEN: '',
      },
    },
    turnFinished: {
      // Transitive state to finish turn and to return to game machine
    },
  },
})

const differentGameMachine = Machine({
  key: 'game',
  initial: 'gameStart',
  context: {
    cellsPlacedPieces: [],
    currentPlayer: 1,
    unplacedPiecesPlayer1: [],
    unplacedPiecesPlayer2: [],
  },
  states: {
    gameStart: {
      entry: assign((context) => {
        // Select start player (propose random, animated in UI as coin flip or something)
      }),
    },
    playerTurn: {
      // Enter "sub"-machine to handle player turn
    },
    checkGameFinished: {
      on: {
        // Transient transition with conditionals to check whether game is over
        '': [
          {
            target: 'gameOver',
            cond: '' /* Conditional logic to check if queen is surrounded */,
          },
          { target: 'changeTurn' },
        ],
      },
    },
    changeTurn: {
      // Transient state that simply changes player turn
    },
    gameOver: {},
  },
})
