import { assign, MachineOptions } from 'xstate'
import { haveSameCubeCoordinates } from '../lib/hex'
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
import { InsectName } from '../lib/insect'

export interface TurnStateSchema {
  initial: 'selecting'
  states: {
    selecting: {}
    selectedToPlace: {}
    placing: {}
    moving: {}
    finish: {}
  }
}

export const turnMachineInitialContext: TurnContext = {
  selectableCells: [] as Cell[],
  cellsPossibleDestinationsCurrentMove: [],
  cellsAllowedToMove: [],
  insectsAllowedToPlace: [],
  selectedUnplayedInsect: undefined,
  selectedCell: undefined,
  placementCells: undefined,
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
          cells: (context) => [...context.boardCells],
          selectableCells: (context) => context.cellsAllowedToMove!,
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
          selectedUnplayedInsect: (_, event: Event) => {
            return event.type === 'UNPLAYEDPIECE.SELECT'
              ? event.insectName
              : InsectName.ant
          },
        }),
        'createAndSetPlacementCells',
        assign<Context, Event>({
          cells: (context) => [
            ...context.boardCells,
            ...context.placementCells!,
          ],
          selectableCells: (context) => [
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
          {
            target: 'selecting',
            cond: 'toggledUnplayedInsectSelection',
            actions: ['resetSelectedUnplayedInsect'],
          },
          // Otherwise selected another unplayed insect to place
          { target: 'selectedToPlace' },
        ],
      },
    },
    // 'placing' and 'moving' states might possibly be merged into 1 state called 'playing'
    placing: {
      entry: [
        // 'resetPlacementCells',
        'placeInsectAndUpdateUnplaced',
        assign<Context, Event>({
          placementCells: () => [],
        }),
      ],
      always: [{ target: 'finish' }],
      // after: {
      //   // After a 1s animation, go to finished state
      //   500: '#check',
      // },
    },
    moving: {
      // Animation to be played in frontend while in this state
      entry: assign({
        cellsPossibleDestinationsCurrentMove: (_) => [], // Reset possible destinations (not sure if needed)
      }),
      always: [{ target: 'finish' }],
      // after: {
      //   // After a 1s animation, go to finished state
      //   500: '#check',
      // },
    },
    finish: {
      entry: [
        // Cleanup
        assign<Context, Event>({
          selectedCell: () => undefined,
          selectedUnplayedInsect: () => undefined,
          selectableCells: () => [],
          cells: (context) => [...context.boardCells],
        }),
      ],
      always: [{ target: '#check' }],
    },
  },
}

export const turnMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {
    setSelectedCell: assign({
      selectedCell: (_, event) =>
        event.type === 'CELL.SELECT' ? event.cell : undefined,
    }),
    setCellsAllowedToMove: assign({
      // cellsAllowedToMove: () => [] as Cell[],
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
      placementCells: (context) => {
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
      unplayedInsectsPlayer1: (context) => {
        if (context.currentPlayer === 1) {
          return removeInsectFromUnplayed(
            context.unplayedInsectsPlayer1,
            context.selectedUnplayedInsect!
          )
        } else {
          return context.unplayedInsectsPlayer1
        }
      },
      unplayedInsectsPlayer2: (context) => {
        if (context.currentPlayer === 2) {
          return removeInsectFromUnplayed(
            context.unplayedInsectsPlayer2,
            context.selectedUnplayedInsect!
          )
        } else {
          return context.unplayedInsectsPlayer2
        }
      },
      boardCells: (context) => [
        ...context.boardCells,
        createCellWithInsect(
          context.selectedCell!.coord,
          context.selectedUnplayedInsect!,
          context.currentPlayer
        ),
      ],
    }),
    resetSelectedUnplayedInsect: assign({
      selectedUnplayedInsect: (context) => undefined,
    }),
  },
  guards: {
    // New selection is same as previous selection, indicating a toggle
    toggledCellSelection: () => {
      // context.selectedCell
      return false
    },
    toggledUnplayedInsectSelection: (context, event) => {
      return event.type === 'UNPLAYEDPIECE.SELECT'
        ? event.insectName === context.selectedUnplayedInsect
        : false
    },
    selectedCellIsTempPlacementCell: (context, event) => {
      if (event.type !== 'CELL.SELECT') {
        return false
      }
      const selectedCell = event.cell
      return (
        // TODO would be nicer to create game method to check equivalence of cells rather than comparing with hex method of coordinates
        context.placementCells?.findIndex((cell) =>
          haveSameCubeCoordinates(selectedCell.coord, cell.coord)
        ) !== -1
      )
    },
  },
}
