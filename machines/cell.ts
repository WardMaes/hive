import { Machine, assign } from 'xstate'

import { Cell } from '../lib/hex'

// The hierarchical (recursive) schema for the states
interface CellStateSchema {
  states: {
    idle: {}
    selected: {}
  }
}

// The events that the machine handles
type CellEvent = { type: 'SELECT' }

// The context (extended state) of the machine
interface CellContext extends Cell {}

export const createCellMachine = (cell: Cell) =>
  Machine<CellContext, CellStateSchema, CellEvent>({
    id: 'cell',
    initial: 'idle',
    context: {
      x: cell.x,
      y: cell.y,
      z: cell.z,
      occupied: cell.occupied,
    },
    states: {
      idle: {},
      selected: {},
    },
    on: {
      SELECT: {
        target: 'selected',
        actions: assign({
          occupied: (context) => !context.occupied,
        }),
      },
    },
  })
