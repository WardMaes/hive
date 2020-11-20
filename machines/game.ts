import { Machine, assign, MachineOptions } from 'xstate'

import { getStartInsectsPlayer } from '../lib/game'
import { createRoom, joinRoom } from '../lib/p2p'

import { GameContext } from './types/game.types'
import { Context, Event, Schema } from './types'

import { mergeMachineOptions } from './helper'
import {
  turnMachine,
  turnMachineConfig,
  turnMachineInitialContext,
} from './turn'

const gameMachineInitialContext: GameContext = {
  cells: [],
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
          // target: 'playing',
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
        src: (_) => (callback) => {
          return createRoom(callback)
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
        actions: [
          assign({
            currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1), // Alternate between players
            turn: (context) =>
              context.currentPlayer === 1 ? context.turn + 1 : context.turn,
          }),
        ],
        target: 'opponentTurn',
        // target: 'playing',
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
      entry: [
        assign({
          currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1),
          turn: (context) =>
            context.currentPlayer === 1 ? context.turn + 1 : context.turn,
        }),
      ],
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
