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
    // initializing: {}
    menu: {}
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
}

const gameMachineSansOptions = Machine<Context, Schema, Event>({
  id: 'game',
  initial: 'menu',
  states: {
    menu: {
      on: {
        'GAME.JOIN': {
          target: 'playing', // TODO: go to /rooms/[roomId]
          actions: ['joinRoom'],
        },
        'GAME.CREATE': {
          target: 'playing', // TODO: go to /rooms/[roomId]
          actions: ['createRoom'],
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
})

const gameMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {
    createRoom: () => {
      // console.log('actions.createRoom', context, event)
      // create new room, with user as host
      createRoom()
    },
    joinRoom: (_, event) => {
      // console.log('actions.createRoom', context, event)
      // create new room, with user as host
      // @ts-ignore
      joinRoom(event.code || 'abc')
    },
  },
  guards: {
    isGameOver: () => {
      // return isGameOver(context.boardCells)
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
