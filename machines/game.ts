import { Machine, assign } from 'xstate'

import { HexCoord } from '../lib/hex'
import { Insect } from '../lib/insect'
import { turnMachine, TurnContext, TurnEvent } from './turn'

const startCells: Cell[] = [
  { coord: { x: 1, y: 1, z: -2 }, insects: [] },
  { coord: { x: 2, y: -1, z: -1 }, insects: [] },
  { coord: { x: 1, y: 2, z: -3 }, insects: [] },
  { coord: { x: 0, y: 3, z: -3 }, insects: [] },
  { coord: { x: 0, y: 0, z: 0 }, insects: [] }, // center
  { coord: { x: -1, y: 1, z: 0 }, insects: [] }, // top left
  { coord: { x: 0, y: 1, z: -1 }, insects: [] }, // top center
  { coord: { x: 1, y: 0, z: -1 }, insects: [] }, // top right
  { coord: { x: -1, y: 0, z: 1 }, insects: [] }, // bottom left
  { coord: { x: 0, y: -1, z: 1 }, insects: [] }, // bottom center
  { coord: { x: 1, y: -1, z: 0 }, insects: [] }, // bottom right
]

export enum InsectName {
  'ant' = 'Ant',
  'beetle' = 'Beetle',
  'queen' = 'Queen Bee',
  'grasshopper' = 'Grasshopper',
  'spider' = 'Spider',
}

export type Board = {
  cells: Cell[]
}

export type Cell = {
  coord: HexCoord
  insects: Insect[]
}

export type Context = GameContext & TurnContext

export type Event = GameEvent | TurnEvent

export interface GameContext {
  // Game-specific context
  cellsOnBoard: Cell[]
  currentPlayer: number
  unplacedInsectsPlayer1: Insect[]
  unplacedInsectsPlayer2: Insect[]
}

export type GameEvent = { type: '' }

export interface Schema {
  states: {
    initializing: {}
    playing: {
      states: {
        initializing: {}
        selecting: {}
        placing: {}
        moving: {}
        finished: {}
      }
    }
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

export const gameMachine = Machine<Context, Schema, Event>({
  id: 'game',
  initial: 'initializing',
  context: {
    // Game-specific context
    cellsOnBoard: startCells,
    currentPlayer: 1,
    unplacedInsectsPlayer1: [
      {
        name: InsectName.queen,
        validCells: () => [],
      },
      {
        name: InsectName.ant,
        validCells: () => [],
      },
      {
        name: InsectName.ant,
        validCells: () => [],
      },
      {
        name: InsectName.ant,
        validCells: () => [],
      },
      {
        name: InsectName.beetle,
        validCells: () => [],
      },
      {
        name: InsectName.beetle,
        validCells: () => [],
      },
      {
        name: InsectName.spider,
        validCells: () => [],
      },
      {
        name: InsectName.spider,
        validCells: () => [],
      },
      {
        name: InsectName.grasshopper,
        validCells: () => [],
      },
      {
        name: InsectName.grasshopper,
        validCells: () => [],
      },
      {
        name: InsectName.grasshopper,
        validCells: () => [],
      },
    ],
    unplacedInsectsPlayer2: [],
    // Turn-specific context
    selectedPiece: null,
    cellsPossibleDestinationsCurrentMove: [],
    // 'piecesAllowedToBeMoved' and 'piecesAllowedToBePlaced' could maybe be merged into 1 property 'piecesAllowedToBePlayed'
    piecesAllowedToBeMoved: [],
    piecesAllowedToBePlaced: [],
  },
  states: {
    initializing: {
      entry: assign((_) => ({
        // Select start player (propose random, animated in UI as coin flip or something)
        // Set initial pieces for both players
        // unplacedInsectsPlayer1: [],
        unplacedInsectsPlayer2: [],
      })),
      always: 'playing',
    },
    playing: {
      ...turnMachine,
      onDone: {
        target: 'checkGameFinished',
      },
    },
    checkGameFinished: {
      // Transient transition with conditionals to check whether game is over
      always: [
        {
          target: 'gameOver',
          cond: false /* Conditional logic to check if queen is surrounded */,
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
