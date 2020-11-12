import {
  Cell,
  CellStateEnum,
  removeCellStates,
  removeCellStatesFromCells,
} from '../game'
import { InsectName } from '../insect'

describe('Game logic testing', () => {
  const cellA: Cell = {
    coord: { x: Infinity, y: Infinity, z: Infinity },
    pieces: [],
    state: [
      CellStateEnum.DESTINATION,
      CellStateEnum.SELECTABLE,
      CellStateEnum.SELECTED,
    ],
  }
  const cellB: Cell = {
    coord: {
      x: 0,
      y: 0,
      z: 0,
    },
    pieces: [
      {
        insectName: InsectName.ant,
        ofPlayer: 1,
      },
    ],
    state: [CellStateEnum.SELECTABLE],
  }
  it('should return the cell with the given states removed', () => {
    expect(
      removeCellStates(
        [CellStateEnum.DESTINATION, CellStateEnum.SELECTED],
        cellA
      ).state
    ).toEqual([CellStateEnum.SELECTABLE])
    expect(removeCellStates([CellStateEnum.TEMPORARY], cellA).state).toEqual([
      CellStateEnum.DESTINATION,
      CellStateEnum.SELECTABLE,
      CellStateEnum.SELECTED,
    ])
    expect(
      removeCellStates(
        [
          CellStateEnum.DESTINATION,
          CellStateEnum.SELECTABLE,
          CellStateEnum.SELECTED,
        ],
        cellA
      ).state
    ).toEqual([])

    expect(removeCellStates([CellStateEnum.SELECTABLE], cellB).state).toEqual(
      []
    )
  })

  it('should return the cells without the given states', () => {
    expect(
      removeCellStatesFromCells(
        [CellStateEnum.DESTINATION, CellStateEnum.SELECTABLE],
        [
          {
            coord: { x: Infinity, y: Infinity, z: Infinity },
            pieces: [],
            state: [
              CellStateEnum.DESTINATION,
              CellStateEnum.SELECTABLE,
              CellStateEnum.SELECTED,
            ],
          },
          {
            coord: { x: Infinity, y: Infinity, z: Infinity },
            pieces: [],
            state: [
              CellStateEnum.DESTINATION,
              CellStateEnum.TEMPORARY,
              CellStateEnum.SELECTED,
            ],
          },
        ]
      )
    ).toEqual([
      {
        coord: { x: Infinity, y: Infinity, z: Infinity },
        pieces: [],
        state: [CellStateEnum.SELECTED],
      },
      {
        coord: { x: Infinity, y: Infinity, z: Infinity },
        pieces: [],
        state: [CellStateEnum.TEMPORARY, CellStateEnum.SELECTED],
      },
    ])
  })
})
