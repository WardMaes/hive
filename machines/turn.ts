import { assign, Actions, MachineConfig, MachineOptions } from 'xstate'
// const { raise } = actions
import { haveSameCubeCoordinates, HexCoord } from '../lib/hex'
import {
  getValidPlacementCoordinates,
  createTempEmptyCell,
  createCellWithInsect,
  removeInsectFromUnplayed,
  filterValidInsectsToPlace,
  Cell,
} from '../lib/game'
import { Context, Event } from './types'
import { TurnContext } from './types/turn.types'

export interface TurnStateSchema {
  initial: 'selecting'
  states: {
    selecting: {}
    selectedToPlace: {}
    placing: {}
    moving: {}
  }
}

export const turnMachineInitialContext: TurnContext = {
  selectableCells: [],
}

export const turnMachine: TurnStateSchema = {
  initial: 'selecting',
  states: {
    selecting: {
      // Set which pieces can be moved and which insects can be placed so user can select one
      entry: [
        'setCellsAllowedToMove',
        'setInsectsAllowedToPlace',
        assign<Context, Event>({
          selectableCells: (context, event) => context.cellsAllowedToMove!,
        }),
      ],
      on: {
        'UNPLAYEDPIECE.SELECT': { target: 'selectedToPlace' },
        // 'CELL.SELECT': { target: 'prepareToMove' },
      },
    },
    selectedToPlace: {
      entry: [
        assign<Context, Event>({
          selectedUnplayedInsect: (context: Context, event: Event) =>
            event.insectName,
        }),
        'createAndSetPlacementCells',
        assign<Context, Event>({
          cells: (context, event) => [
            ...context.boardCells,
            ...context.placementCells!,
          ],
          selectableCells: (context, event) => [
            ...context.selectableCells,
            ...context.placementCells!,
          ],
        }),
      ],
      on: {
        'CELL.SELECT': [
          // Selected cell was a temporary cell corresponding to a placement location
          {
            target: 'placing',
            cond: 'selectedCellIsTempPlacementCell',
            actions: ['setSelectedCell'],
          },
          // Otherwise was an already placed cell and player wants to exit placement and enter movement with that piece
          // { target: "selectedToMove"}
        ],
        'UNPLAYEDPIECE.SELECT': [
          // Check if selected piece was toggled
          { target: 'selecting', cond: 'toggledUnplayedInsectSelection' },
          // Otherwise selected another unplayed insect to place
          { target: 'selectedToPlace' },
        ],
      },
    },
    // 'placing' and 'moving' states might possibly be merged into 1 state called 'playing'
    placing: {
      entry: [
        'resetPlacementCells',
        'placeInsectAndUpdateUnplaced',
        assign<Context, Event>({
          placementCells: (context, event) => [],
          selectableCells: (context, event) => [],
          cells: (context, event) => [...context.boardCells],
        }),
      ],
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

export const turnMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {
    setSelectedCell: assign({
      selectedCell: (context, event) => event.cell,
    }),
    setCellsAllowedToMove: assign({
      // cellsAllowedToMove: (context) => context.game.
      cellsAllowedToMove: (context) => [],
    }),
    setInsectsAllowedToPlace: assign({
      insectsAllowedToPlace: (context) =>
        filterValidInsectsToPlace(
          context.currentPlayer === 1
            ? context.unplayedInsectsPlayer1
            : context.unplayedInsectsPlayer2,
          context.turn
        ),
    }),
    createAndSetPlacementCells: assign({
      placementCells: (context, event) => {
        const validPlacementCoords = getValidPlacementCoordinates(
          context.boardCells,
          context.currentPlayer
        )
        return validPlacementCoords.map((hexCoord) =>
          createTempEmptyCell(hexCoord)
        )
      },
    }),
    placeInsectAndUpdateUnplaced: assign({
      unplayedInsectsPlayer1: (context, event) => {
        if (context.currentPlayer === 1) {
          return removeInsectFromUnplayed(
            context.unplayedInsectsPlayer1,
            context.selectedUnplayedInsect!
          )
        } else {
          return context.unplayedInsectsPlayer1
        }
      },
      unplayedInsectsPlayer2: (context, event) => {
        if (context.currentPlayer === 1) {
          return removeInsectFromUnplayed(
            context.unplayedInsectsPlayer2,
            context.selectedUnplayedInsect!
          )
        } else {
          return context.unplayedInsectsPlayer2
        }
      },
      boardCells: (context, event) => [
        ...context.boardCells,
        createCellWithInsect(
          context.selectedCell!.coord,
          context.selectedUnplayedInsect!,
          context.currentPlayer
        ),
      ],
    }),
  },
  guards: {
    // New selection is same as previous selection, indicating a toggle
    toggledCellSelection: (context, event) => {
      // context.selectedCell
      return false
    },
    toggledUnplayedInsectSelection: (context, event) => {
      return event.insectName === context.selectedUnplayedInsect
    },
    selectedCellIsTempPlacementCell: (context, event) => {
      const selectedCell: Cell = event.cell
      return (
        // TODO would be nicer to create game method to check equivalence of cells rather than comparing with hex method of coordinates
        context.placementCells?.findIndex((cell) =>
          haveSameCubeCoordinates(selectedCell.coord, cell.coord)
        ) !== -1
      )
    },
  },
}
