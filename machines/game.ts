import { Machine, assign } from 'xstate'

import { Cell } from '../lib/hex'
import { turnMachine } from './turn'

const startCells: Cell[] = [
  // { x: 1, y: 1, z: -2 },
  // { x: 2, y: -1, z: -1 },
  // { x: 1, y: 2, z: -3 },
  // { x: 0, y: 3, z: -3 },
  { x: 0, y: 0, z: 0 }, // center
  { x: -1, y: 1, z: 0 }, // top left
  // { x: 0, y: 1, z: -1 }, // top center
  // { x: 1, y: 0, z: -1 }, // top right
  // { x: -1, y: 0, z: 1 }, // bottom left
  // { x: 0, y: -1, z: 1 }, // bottom center
  // { x: 1, y: -1, z: 0 }, // bottom right
]

export enum Insect {
  'ant',
  'beetle',
  'queen',
  'grasshopper',
  'spider',
}

export interface GameContext {
  cellsPlacedPieces: Cell[]
  currentPlayer: number
  unplacedPiecesPlayer1: Insect[]
  unplacedPiecesPlayer2: Insect[]
}

export type GameEvent = { type: '' }

interface GameStateSchema {
  states: {
    initializing: {}
    playing: {}
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

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
