import { Machine, assign } from 'xstate'
import { Game, Cell, Board, Piece } from '../lib/game'

import { Context, Event } from './types'
import { turnMachine, TurnStateSchema } from './turn'

const startCells: Cell[] = [
  { coord: { x: 1, y: 1, z: -2 }, pieces: [] },
  { coord: { x: 2, y: -1, z: -1 }, pieces: [] },
  { coord: { x: 1, y: 2, z: -3 }, pieces: [] },
  { coord: { x: 0, y: 3, z: -3 }, pieces: [] },
  { coord: { x: 0, y: 0, z: 0 }, pieces: [] }, // center
  { coord: { x: -1, y: 1, z: 0 }, pieces: [] }, // top left
  { coord: { x: 0, y: 1, z: -1 }, pieces: [] }, // top center
  { coord: { x: 1, y: 0, z: -1 }, pieces: [] }, // top right
  { coord: { x: -1, y: 0, z: 1 }, pieces: [] }, // bottom left
  { coord: { x: 0, y: -1, z: 1 }, pieces: [] }, // bottom center
  { coord: { x: 1, y: -1, z: 0 }, pieces: [] }, // bottom right
]

export interface Schema {
  states: {
    initializing: {}
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
    },
    guards: {
      isGameOver: (context) => {
        return context.game!.isGameOver()
      },
    },
  }
)
