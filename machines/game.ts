import { Machine, assign, MachineOptions } from 'xstate'
import { getStartInsectsPlayer } from '../lib/game'

import { Context, Event } from './types'
import {
  turnMachine,
  TurnStateSchema,
  turnMachineConfig,
  turnMachineInitialContext,
} from './turn'
import { createRoom, joinRoom } from '../lib/p2p'
import { mergeMachineOptions } from './helper'
import { GameContext } from './types/game.types'

export interface Schema {
  states: {
    menu: {}
    joining: {}
    creating: {}
    playing: TurnStateSchema
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

const gameMachineInitialContext: GameContext = {
  cells: [],
  boardCells: [],
  currentPlayer: 1,
  turn: 1,
  unplayedInsectsPlayer1: getStartInsectsPlayer(),
  unplayedInsectsPlayer2: getStartInsectsPlayer(),
  roomId: '',
  playerId: 1,
}

const gameMachineSansOptions = Machine<Context, Schema, Event>({
  id: 'game',
  initial: 'menu',
  states: {
    menu: {
      on: {
        'GAME.JOIN': {
          target: 'joining', // TODO: go to /rooms/[roomId]
        },
        'GAME.CREATE': {
          target: 'creating', // TODO: go to /rooms/[roomId]
        },
      },
    },
    joining: {
      invoke: {
        id: 'joinRoom',
        src: (_, event) => (callback) => {
          if (event.type !== 'GAME.JOIN') {
            return
          }
          return joinRoom(event.code, callback)
        },
        onDone: {
          target: 'playing',
          actions: assign({
            playerId: (_) => 2,
          }),
        },
      },
    },
    creating: {
      invoke: {
        id: 'createRoom',
        src: (_) => (callback) => {
          return createRoom(callback)
        },
        onDone: {
          target: 'playing',
          actions: assign({ roomId: (_, event) => event.data }),
        },
      },
    },
    playing: {
      ...turnMachine,
    },
    checkGameFinished: {
      id: 'check',
      // Transient transition with conditionals to check whether game is over
      always: [
        // {
        //   target: 'gameOver',
        //   cond: 'isGameOver',
        // },
        { target: 'alternating' },
      ],
    },
    alternating: {
      // Transient state that simply changes player turn
      always: {
        actions: [
          (context) => {
            console.log(context)
          },
          assign({
            currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1), // Alternate between players
          }),
          assign({
            // Increment turn if changed from player 2 to player 1
            turn: (context) =>
              context.currentPlayer === 1 ? context.turn + 1 : context.turn + 1,
          }),
        ],
        target: 'playing',
      },
    },
    gameOver: {},
  },
  on: {
    SYNC: {
      actions: [
        () => console.log('SYNC'),
        assign({
          boardCells: (_, event) => event.state.boardCells,
          cells: (_, event) => event.state.cells,
          currentPlayer: (_, event) => event.state.currentPlayer,
        }),
      ],
    },
  },
})

const gameMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {},
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
