import { assign, MachineOptions } from 'xstate'
import { haveSameCubeCoordinates } from '../lib/hex'
import {
  CellStateEnum,
  addCellStates,
  createTempEmptyCellsForMissingCoords,
  createTempEmptyCell,
  filterValidInsectsToPlace,
  getValidCellsToMove,
  getValidMovesForCell,
  getValidPlacementCoordinates,
  removeCellStates,
  removeInsectFromUnplayed,
  getTopPieceOfCell,
  filterTempCells,
  removeCellStatesFromCells,
} from '../lib/game'
import { Context, Event } from './types'
import { TurnContext, TurnStateSchema } from './types/turn.types'

export const turnMachineInitialContext: TurnContext = {
  selectableCells: [],
  cellsAllowedToMove: [],
  insectsAllowedToPlace: [],
  selectedUnplayedInsect: undefined,
  selectedCell: undefined,
  placementCells: undefined,
  tempCells: [],
  validDestinations: [],
  validMoves: [],
}

export const turnMachine: TurnStateSchema = {
  initial: 'selecting',
  states: {
    selecting: {
      // Set which pieces can be moved and which insects can be placed so user can select one
      entry: [
        // (context) => {
        //   console.log(context)
        // },
        // 'filterEmptyTempCells',
        // 'removeDestinationStates',
        'setCellsAllowedToMove',
        'setInsectsAllowedToPlace',
      ],
      on: {
        'UNPLAYEDPIECE.SELECT': { target: 'selectedToPlace' },
        'CELL.SELECT': { target: 'selectedToMove' },
      },
    },
    selectedToPlace: {
      entry: ['setSelectedUnplayedInsect', 'setPlacementCells'],
      on: {
        'CELL.SELECT': [
          // Selected cell was a temporary cell corresponding to a placement location
          {
            target: 'placing',
            cond: 'selectedCellIsDestination',
          },
          // Otherwise was an already placed cell and player wants to exit placement and enter movement with that piece
          {
            target: 'selectedToMove',
          },
        ],
        'UNPLAYEDPIECE.SELECT': [
          {
            target: 'selecting',
            // Check if selected piece was toggled
            cond: 'toggledUnplayedInsectSelection',
            actions: ['resetSelectedUnplayedInsect', 'filterEmptyTempCells'],
          },
          // Otherwise selected another unplayed insect to place
          {
            target: 'selectedToPlace',
            actions: ['resetSelectedUnplayedInsect', 'filterEmptyTempCells'],
          },
        ],
      },
    },
    selectedToMove: {
      entry: [
        'filterEmptyTempCells',
        'removeDestinationStates',
        'setSelectedCell',
        'setDestinationsOfMoves',
      ],
      on: {
        'CELL.SELECT': [
          // Select a move destination cell
          {
            target: 'moving',
            cond: 'selectedCellIsDestination',
          },
          // Toggle already selected cell
          {
            target: 'selecting',
            cond: 'toggledCellSelection',
            actions: ['resetSelectedCell'],
          },
          // Select another cell which is not the selected cell or one of its destinations
          // If it is a cell that was valid to move, switch to moving with that cell
          { target: 'selectedToMove' },
        ],
        'UNPLAYEDPIECE.SELECT': [
          // If a placable insect is selected, switch to placing that
          { target: 'selectedToPlace', actions: ['resetSelectedCell'] },
        ],
      },
    },
    placing: {
      entry: ['placeInsectAndUpdateUnplaced', 'resetSelectedUnplayedInsect'],
      always: [{ target: 'finish' }],
      // after: {
      //   // After a 1s animation, go to finished state
      //   500: '#check',
      // },
    },
    moving: {
      // Animation to be played in frontend while in this state
      entry: ['moveSelectedToDestination'],
      always: [{ target: 'finish' }],
      // after: {
      //   // After a 1s animation, go to finished state
      //   500: '#check',
      // },
    },
    finish: {
      entry: [
        // Cleanup
        (context) => {
          console.log(context)
        },
        'filterEmptyTempCells',
        assign<Context>({
          cells: ({ cells }) =>
            removeCellStatesFromCells(
              [
                CellStateEnum.DESTINATION,
                CellStateEnum.SELECTABLE,
                CellStateEnum.SELECTED,
              ],
              cells
            ),
        }),
        (context) => {
          console.log(context)
        },
      ],
      always: [{ target: '#check' }],
    },
  },
}

export const turnMachineConfig: Partial<MachineOptions<Context, Event>> = {
  actions: {
    removeSelectableStates: assign({
      cells: (context) =>
        removeCellStatesFromCells([CellStateEnum.SELECTABLE], context.cells),
    }),
    resetSelectedCell: assign({
      cells: (context) =>
        removeCellStatesFromCells([CellStateEnum.SELECTED], context.cells),
    }),
    removeDestinationStates: assign({
      cells: (context) =>
        removeCellStatesFromCells([CellStateEnum.DESTINATION], context.cells),
    }),
    filterEmptyTempCells: assign({
      cells: (context) => {
        // Remove TEMP state if it has pieces
        const cells = context.cells.map((cell) => {
          if (
            cell.state.includes(CellStateEnum.TEMPORARY) &&
            cell.pieces.length > 0
          ) {
            return removeCellStates([CellStateEnum.TEMPORARY], cell)
          }
          return cell
        })
        return filterTempCells(cells)
      },
    }),
    setDestinationsOfMoves: assign({
      cells: (context, event) => {
        if (event.type === 'CELL.SELECT') {
          const selectedCell = event.cell
          const moves = getValidMovesForCell(selectedCell, context.cells)
          const destinations = moves.map((move) => move.destination)
          const existingCells = context.cells.map((cell) => {
            const isDestination = destinations.findIndex((destCoord) =>
              haveSameCubeCoordinates(destCoord, cell.coord)
            )
            if (!isDestination) {
              cell = removeCellStates([CellStateEnum.DESTINATION], cell)
            } else {
              cell = addCellStates([CellStateEnum.DESTINATION], cell)
            }
            return cell
          })
          const newTempCells = createTempEmptyCellsForMissingCoords(
            destinations,
            existingCells
          ).map((cell) => addCellStates([CellStateEnum.DESTINATION], cell))
          return [...existingCells, ...newTempCells]
        }
        return context.cells
      },
    }),
    setSelectedCell: assign({
      cells: (context, event) => {
        if (event.type === 'CELL.SELECT') {
          const selectedCell = event.cell
          return context.cells.map((cell) => {
            const matchesSelectedCell = haveSameCubeCoordinates(
              selectedCell.coord,
              cell.coord
            )
            if (cell.state.includes(CellStateEnum.SELECTED)) {
              if (matchesSelectedCell) {
                cell.state = cell.state.filter(
                  (el) => el === CellStateEnum.SELECTED
                )
              }
            } else if (matchesSelectedCell) {
              cell.state = [...cell.state, CellStateEnum.SELECTED]
            }
            return cell
          })
        }
        return context.cells
      },
    }),
    setSelectedUnplayedInsect: assign({
      selectedUnplayedInsect: (_, event: Event) => {
        return event.type === 'UNPLAYEDPIECE.SELECT'
          ? event.insectName
          : undefined
      },
    }),
    setCellsAllowedToMove: assign({
      cells: (context) => {
        const moveableCells = getValidCellsToMove(
          context.currentPlayer,
          context.currentPlayer === 1
            ? context.unplayedInsectsPlayer1
            : context.unplayedInsectsPlayer2,
          context.cells
        )
        return context.cells.map((cell) => {
          const isMovable = moveableCells.findIndex((moveCell) =>
            haveSameCubeCoordinates(moveCell.coord, cell.coord)
          )
          if (isMovable) {
            cell.state.push(CellStateEnum.SELECTABLE)
          }
          return cell
        })
      },
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
    setPlacementCells: assign({
      cells: ({ cells, currentPlayer }) => {
        const validPlacementCoords = getValidPlacementCoordinates(
          cells,
          currentPlayer
        )
        return [
          ...cells,
          ...validPlacementCoords.map((coord) => {
            return addCellStates(
              [CellStateEnum.DESTINATION],
              createTempEmptyCell(coord)
            )
          }),
        ]
      },
    }),
    moveSelectedToDestination: assign({
      cells: (context, event) => {
        if (event.type === 'CELL.SELECT') {
          const destinationCell = event.cell
          const selectedCell = context.cells.find((cell) =>
            cell.state.includes(CellStateEnum.SELECTED)
          )!
          // TODO Throw error if no cell is selected cause that should be impossible
          const otherCells = context.cells.filter(
            (cell) =>
              [destinationCell, selectedCell].findIndex((otherCell) =>
                haveSameCubeCoordinates(otherCell.coord, cell.coord)
              ) === -1
          )

          const movingPiece = getTopPieceOfCell(selectedCell)!
          selectedCell.pieces = selectedCell.pieces.slice(0, -1)
          destinationCell.pieces.push(movingPiece)

          return [...otherCells, selectedCell, destinationCell]
        }
        return context.cells
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
      cells: (context, event) => {
        if (event.type === 'CELL.SELECT') {
          const destination = event.cell
          const selectedInsect = context.selectedUnplayedInsect
          return context.cells.map((cell) => {
            if (haveSameCubeCoordinates(cell.coord, destination.coord)) {
              cell.pieces.push({
                insectName: selectedInsect!,
                ofPlayer: context.currentPlayer,
              })
              return cell
            }
            return cell
          })
        }
        return context.cells
      },
    }),
    resetSelectedUnplayedInsect: assign({
      selectedUnplayedInsect: (_) => undefined,
    }),
  },
  guards: {
    // New selection is same as previous selection, indicating a toggle
    toggledCellSelection: (context, event) => {
      if (event.type === 'CELL.SELECT') {
        const prevSelectedCell = context.cells.find((cell) =>
          cell.state.includes(CellStateEnum.SELECTED)
        )
        return !!(
          prevSelectedCell &&
          haveSameCubeCoordinates(event.cell.coord, prevSelectedCell?.coord)
        )
      }
      return false
    },
    toggledUnplayedInsectSelection: (context, event) => {
      return event.type === 'UNPLAYEDPIECE.SELECT'
        ? event.insectName === context.selectedUnplayedInsect
        : false
    },
    selectedCellIsDestination: (context, event) => {
      if (event.type == 'CELL.SELECT') {
        const selectedCell = event.cell
        return selectedCell.state.includes(CellStateEnum.DESTINATION)
      }
      return false
    },
  },
}
