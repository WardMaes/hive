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
      CellStateEnum.MOVEABLE,
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
    state: [CellStateEnum.MOVEABLE],
  }
  it('should return the cell with the given states removed', () => {
    expect(
      removeCellStates(
        [CellStateEnum.DESTINATION, CellStateEnum.SELECTED],
        cellA
      ).state
    ).toEqual([CellStateEnum.MOVEABLE])
    expect(removeCellStates([CellStateEnum.TEMPORARY], cellA).state).toEqual([
      CellStateEnum.DESTINATION,
      CellStateEnum.MOVEABLE,
      CellStateEnum.SELECTED,
    ])
    expect(
      removeCellStates(
        [
          CellStateEnum.DESTINATION,
          CellStateEnum.MOVEABLE,
          CellStateEnum.SELECTED,
        ],
        cellA
      ).state
    ).toEqual([])

    expect(removeCellStates([CellStateEnum.MOVEABLE], cellB).state).toEqual([])
  })

  it('should return the cells without the given states', () => {
    expect(
      removeCellStatesFromCells(
        [CellStateEnum.DESTINATION, CellStateEnum.MOVEABLE],
        [
          {
            coord: { x: Infinity, y: Infinity, z: Infinity },
            pieces: [],
            state: [
              CellStateEnum.DESTINATION,
              CellStateEnum.MOVEABLE,
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
