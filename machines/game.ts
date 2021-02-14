import { Machine, assign, MachineOptions } from 'xstate'

import { Cell, getStartInsectsPlayer } from '../lib/game'
import { createRoom, joinRoom } from '../lib/connection'

import { GameContext } from './types/game.types'
import { Context, Event, Schema } from './types'

import { mergeMachineOptions } from './helper'
import {
  turnMachine,
  turnMachineConfig,
  turnMachineInitialContext,
} from './turn'

// Cells for debugging UI
const initialCellsDebug : Cell[] = [
  {
    "coord": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -1,
      "z": 0
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -1,
      "y": 0,
      "z": 1
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -2,
      "z": 1
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -2,
      "y": 0,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -3,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Queen Bee",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -3,
      "y": 1,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Queen Bee",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -4,
      "z": 3
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -4,
      "y": 2,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -5,
      "z": 4
    },
    "pieces": [
      {
        "insectName": "Spider",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -5,
      "y": 2,
      "z": 3
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -6,
      "z": 5
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -6,
      "y": 3,
      "z": 3
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -7,
      "z": 6
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -7,
      "y": 3,
      "z": 4
    },
    "pieces": [
      {
        "insectName": "Spider",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -8,
      "z": 7
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -8,
      "y": 3,
      "z": 5
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -9,
      "z": 8
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -9,
      "y": 4,
      "z": 5
    },
    "pieces": [
      {
        "insectName": "Spider",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -10,
      "z": 9
    },
    "pieces": [
      {
        "insectName": "Spider",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -10,
      "y": 4,
      "z": 6
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -11,
      "z": 10
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 2
      }
    ],
    "state": []
  }
]

const initialCellsDebug2 : Cell[] = [
  {
    "coord": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -1,
      "z": 0
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -1,
      "y": 0,
      "z": 1
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -2,
      "z": 1
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -2,
      "y": 0,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Grasshopper",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -3,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Queen Bee",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -3,
      "y": 1,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Queen Bee",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -4,
      "z": 3
    },
    "pieces": [
      {
        "insectName": "Beetle",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": -4,
      "y": 2,
      "z": 2
    },
    "pieces": [
      {
        "insectName": "Ant",
        "ofPlayer": 1
      }
    ],
    "state": []
  },
  {
    "coord": {
      "x": 1,
      "y": -5,
      "z": 4
    },
    "pieces": [
      {
        "insectName": "Spider",
        "ofPlayer": 2
      }
    ],
    "state": []
  },
]

const gameMachineInitialContext: GameContext = {
  cells: initialCellsDebug,
  currentPlayer: 1,
  turn: 1,
  unplayedInsectsPlayer1: getStartInsectsPlayer(),
  unplayedInsectsPlayer2: getStartInsectsPlayer(),
  roomId: '',
  playerId: 1,
  error: undefined,
}

const gameMachineSansOptions = Machine<Context, Schema, Event>({
  id: 'game',
  initial: 'menu',
  states: {
    menu: {
      on: {
        'GAME.JOIN': {
          target: 'joining',
        },
        'GAME.CREATE': {
          target: 'creating',
        },
      },
    },
    joining: {
      invoke: {
        id: 'joinRoom',
        src: (context, event) => (callback) => {
          if (event.type !== 'GAME.JOIN') {
            return
          }
          return joinRoom(event.roomId, callback, context)
        },
        onDone: {
          target: 'opponentTurn',
          actions: assign({
            playerId: (_) => 2,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            roomId: (_) => '',
            error: (_, event) => event.data,
          }),
        },
      },
    },
    creating: {
      invoke: {
        id: 'createRoom',
        src: (context, event) => (callback) => {
          if (event.type === 'GAME.CREATE') {
            return createRoom(event.roomId, callback, context)
          }
        },
        onDone: {
          target: 'playing',
          actions: assign({
            roomId: (_, event) => event.data,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            roomId: (_) => '',
            error: (_, event) => event.data,
          }),
        },
      },
    },
    error: {},
    playing: {
      ...turnMachine,
    },
    checkGameFinished: {
      id: 'check',
      // Transient transition with conditionals to check whether game is over
      always: [{ target: 'alternating' }],
    },
    alternating: {
      // Transient state that simply changes player turn
      always: {
        actions: ['changePlayerAndUpdateTurn'],
        target: 'opponentTurn',
      },
    },
    // TODO temp state for online play
    opponentTurn: {
      on: {
        SYNC: [
          {
            target: 'opponentDone',
            cond: (context, event) =>
              context.currentPlayer !== event.state.currentPlayer,
            actions: [
              'updateContextWithSync',
              () => {
                console.log('Opponent Done')
              },
            ],
          },
          {
            actions: [
              () => console.log('SYNC'),
              (context, event) => {
                console.log(
                  context.unplayedInsectsPlayer1,
                  context.unplayedInsectsPlayer2,
                  event.state.unplayedInsectsPlayer1,
                  event.state.unplayedInsectsPlayer2
                )
              },
              'updateContextWithSync',
            ],
          },
        ],
      },
    },
    opponentDone: {
      entry: ['changePlayerAndUpdateTurn'],
      always: 'playing',
    },
    gameOver: {},
  },
  on: {
    RESET: {
      target: 'menu',
      actions: assign((_) => ({ ...gameMachineInitialContext })),
    },
    // SYNC: {},
  },
})

const gameMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {
    updateContextWithSync: assign({
      roomId: (context, event) => {
        return event.type === 'SYNC' ? event.state.roomId : context.roomId
      },
      cells: (context, event) => {
        console.log(event)
        return event.type === 'SYNC' ? event.state.cells : context.cells
      },
      // Update playerhand of opponent
      // unplayedInsectsPlayer1: (context, event) =>
      //   context.currentPlayer === 2 && event.type === 'SYNC'
      //     ? event.state.unplayedInsectsPlayer1
      //     : context.unplayedInsectsPlayer1,
      // unplayedInsectsPlayer2: (context, event) =>
      //   context.currentPlayer === 1 && event.type === 'SYNC'
      //     ? event.state.unplayedInsectsPlayer2
      //     : context.unplayedInsectsPlayer2,
    }),
    changePlayerAndUpdateTurn: assign({
      currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1), // Alternate between players
      turn: (context) =>
        // Seems that if context.currentPlayer changes back to one should work but idk why but it works correctly with 2 instead
        context.currentPlayer === 2 ? context.turn + 1 : context.turn,
    }),
  },
  guards: {
    isGameOver: () => {
      // TODO: isGameOver(context.boardCells)
      return false
    },
  },
}

const machineInitialContext: Context = {
  ...gameMachineInitialContext,
  ...turnMachineInitialContext,
}

const machineConfig = mergeMachineOptions([
  gameMachineConfig,
  turnMachineConfig,
])

export const gameMachine = gameMachineSansOptions
  .withContext(machineInitialContext)
  .withConfig(machineConfig)
