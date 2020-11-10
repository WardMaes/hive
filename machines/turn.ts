import { assign, Actions, MachineConfig } from 'xstate'
// const { raise } = actions
import { haveSameCubeCoordinates, HexCoord } from '../lib/hex'
import { Insect } from '../lib/insect'
import { Schema } from './game'
import { Context, Event } from './types'

export interface TurnStateSchema {
  initial: 'selecting'
  states: {
    selecting: {}
    prepareToPlace: {}
    placing: {}
    moving: {}
  }
}

export const turnMachine: TurnStateSchema = {
  initial: 'selecting',
  states: {
    selecting: {
      // Set which pieces can be moved and which insects can be placed so user can select one
      entry: ['setCellsAllowedToMove', 'setInsectsAllowedToPlace'],
      on: {
        PLACESELECT: { target: 'prepareToPlace' },
        MOVE: { target: 'moving' },
      },
    },
    prepareToPlace: {
      entry: [
        assign<Context, Event>({
          selectedToPlace: (context: Context, event: Event) => event.insect,
          validPlacementCoords: (context: Context, event: Event) =>
            context.game!.getValidPlacementCoordinates(context.currentPlayer),
        }),
      ],
      on: {
        UNSELECT: {
          target: 'selecting',
        },
        PLACESELECT: {
          target: '',
        },
      },
    },
    // 'placing' and 'moving' states might possibly be merged into 1 state called 'playing'
    placing: {
      entry: [
        assign<Context, Event>({
          placementCoord: (context: Context, event: Event) => event.coord,
        }),
      ],
      actions: [
        (context: Context, event: Event) => {
          context.game!.placeInsect(
            context.selectedToPlace!,
            context.placementCoord!,
            context.currentPlayer
          )
        },
        'updateBoardCells',
      ],
      // Animation to be played in frontend while in this state
      // entry: assign({
      //   cellsPossibleDestinationsCurrentMove: (_) => [], // Reset possible destinations (not sure if needed)
      //   cellsOnBoard: (context: Context, event) => {
      //     const cellIndexToUpdate = context.cellsOnBoard.findIndex((cell) =>
      //       haveSameCubeCoordinates(cell.coord, context.selectedPiece.coord)
      //     )
      //     const copy = context.cellsOnBoard
      //     copy[cellIndexToUpdate].pieces.push(event.)
      //     return copy
      //   },
      // }),
      after: {
        // After a 1s animation, go to finished state
        500: '#check',
      },
    },
    moving: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (_) => [], // Reset possible destinations (not sure if needed)
      }),
      after: {
        // After a 1s animation, go to finished state
        500: '#check',
      },
    },
  },
}

// const actions = {
//   resetTurnContext: (context, event) => true,
// }
