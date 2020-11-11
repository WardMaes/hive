import { assign, MachineOptions } from 'xstate'
import { haveSameCubeCoordinates } from '../lib/hex'
import {
  Cell,
  createTempEmptyCell,
  createCellWithInsect,
  filterValidInsectsToPlace,
  getValidCellsToMove,
  getValidMovesForCell,
  getValidPlacementCoordinates,
  removeInsectFromUnplayed,
} from '../lib/game'
import { Context, Event } from './types'
import { TurnContext } from './types/turn.types'

export interface TurnStateSchema {
  initial: 'selecting'
  states: {
    selecting: {}
    selectedToPlace: {}
    selectedToMove: {}
    placing: {}
    moving: {}
    finish: {}
  }
}

export const turnMachineInitialContext: TurnContext = {
  selectableCells: [] as Cell[],
  cellsAllowedToMove: [],
  insectsAllowedToPlace: [],
  selectedUnplayedInsect: undefined,
  selectedCell: undefined,
  placementCells: undefined,
  validDestinations: [],
  validMoves: [],
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
        'CELL.SELECT': { target: 'selectedToMove' },
      },
    },
    selectedToPlace: {
      entry: [
        assign<Context, Event>({
          selectedUnplayedInsect: (_, event: Event) => {
            return event.type === 'UNPLAYEDPIECE.SELECT'
              ? event.insectName
              : undefined
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
    selectedToMove: {
      entry: ['setSelectedCell'],
      actions: [
        // Generate possible moves
        'generateAndSetPossibleMoves',
        // Set destinations on context in way which UI can interact with it
        assign({}),
      ],
      on: {
        'CELL.SELECT': [
          // Select a move destination cell
          {
            target: 'moving',
            cond: (context: Context, event: Event) => {
              if (event.type === 'CELL.SELECT') {
                context.validDestinations.findIndex((destCell) =>
                  haveSameCubeCoordinates(destCell.coord, event.cell.coord)
                )
              }
              return false
            },
          },
          // Toggle already selected cell
          {
            target: 'selecting',
            cond: (context: Context, event: Event) => {
              if (event.type === 'CELL.SELECT') {
                return (
                  context.selectedCell &&
                  haveSameCubeCoordinates(
                    context.selectedCell.coord,
                    event.cell.coord
                  )
                )
              }
              return false
            },
            actions: ['resetSelectedCell'],
          },
          // Select another cell which is not the selected cell or one of its destinations
          // If it is a cell that was valid to move, switch to moving with that cell
          { target: 'selectedToMove' },
        ],
        'UNPLAYEDPIECE.SELECT': [
          // If a placable insect is selected, switch to placing that
          { target: 'selectedToPlace' },
        ],
      },
    },
    placing: {
      entry: [
        'setSelectedCell',
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
    generateAndSetPossibleMoves: assign({
      validMoves: (context) => {
        const selectedCell = context.selectedCell!
        const boardCells = context.boardCells

        return getValidMovesForCell(selectedCell, boardCells)
      },
    }),
    setSelectedCell: assign({
      selectedCell: (_, event) =>
        event.type === 'CELL.SELECT' ? event.cell : undefined,
    }),
    setCellsAllowedToMove: assign({
      cellsAllowedToMove: (context) =>
        getValidCellsToMove(
          context.currentPlayer,
          context.currentPlayer === 1
            ? context.unplayedInsectsPlayer1
            : context.unplayedInsectsPlayer2,
          context.boardCells
        ),
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
    resetSelectedCell: assign({
      selectedCell: (_) => undefined,
    }),
    resetSelectedUnplayedInsect: assign({
      selectedUnplayedInsect: (_) => undefined,
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
