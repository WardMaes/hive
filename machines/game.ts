import { Machine, assign } from 'xstate'
import { Game } from '../lib/game'

import { Context, Event } from './types'
import { turnMachine, TurnStateSchema } from './turn'
import { createRoom, joinRoom } from '../lib/p2p'

export interface Schema {
  states: {
    initializing: {}
    menu: {}
    playing: TurnStateSchema
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

export const gameMachine = Machine<Context, Schema, Event>(
  {
    id: 'game',
    initial: 'initializing',
    context: {
      // Game-specific context
      cellsOnBoard: [], //startCells,
      currentPlayer: 1,
      turn: 1,
      // Turn-specific context
      // selectedPiece: undefined,
      // cellsPossibleDestinationsCurrentMove: [],
      // 'piecesAllowedToBeMoved' and 'piecesAllowedToBePlaced' could maybe be merged into 1 property 'piecesAllowedToBePlayed'
      // cellsAllowedToMove: [],
      // insectsAllowedToPlace: [],
    },
    states: {
      initializing: {
        entry: [
          assign<Context, Event>({
            // Select start player (propose random, animated in UI as coin flip or something)
            // Intitialze game object which is a facade for all game logic
            game: () => new Game({ expansions: [] }),
          }),
          'updateUnplacedInsects',
        ],
        always: 'playing',
      },
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
          {
            target: 'gameOver',
            cond: 'isGameOver',
          },
          { target: 'alternating' },
        ],
      },
      alternating: {
        // Transient state that simply changes player turn
        always: {
          actions: [
            assign({
              currentPlayer: (context) => (context.currentPlayer === 1 ? 2 : 1), // Alternate between players
            }),
            assign({
              // Increment turn if changed from player 2 to player 1
              turn: (context) =>
                context.currentPlayer === 1
                  ? context.turn + 1
                  : context.turn + 1,
            }),
          ],
          target: 'playing',
        },
      },
      gameOver: {},
    },
  },
  {
    actions: {
      updateBoardCells: assign({
        cellsOnBoard: (context, event) => context.game!.boardCells,
      }),
      updateUnplacedInsects: assign({
        unplacedInsectsPlayer1: (context) =>
          context.game!.getUnplayedInsectsPlayer(1),
        unplacedInsectsPlayer2: (context) =>
          context.game!.getUnplayedInsectsPlayer(2),
      }),
      setCellsAllowedToMove: assign({
        // cellsAllowedToMove: (context) => context.game.
        cellsAllowedToMove: (context) => [],
      }),
      setInsectsAllowedToPlace: assign({
        insectsAllowedToPlace: (context) =>
          context.game!.getValidInsectsToPlace(
            context.currentPlayer,
            context.turn
          ),
      }),
      setValidPlacementCoords: assign({
        validPlacementCoords: (context) =>
          context.game!.getValidPlacementCoordinates(context.currentPlayer),
      }),
      createRoom: (context, event) => {
        // console.log('actions.createRoom', context, event)
        // create new room, with user as host
        createRoom()
      },
      joinRoom: (context, event) => {
        // console.log('actions.createRoom', context, event)
        // create new room, with user as host
        // @ts-ignore
        joinRoom(event.code || 'abc')
      },
    },
    guards: {
      isGameOver: (context) => {
        return context.game!.isGameOver()
      },
    },
  }
)
