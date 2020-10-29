import { Machine, assign, spawn } from 'xstate'

import { Cell } from '../lib/hex'
import { createCellMachine } from './cell'

// TODO: update ref typing
interface CellAndRef extends Cell {
  ref?: any
}

// The hierarchical (recursive) schema for the states
interface GameStateSchema {
  states: {
    initial: {}
    ready: {}
  }
}

// The events that the machine handles
type GameEvent = { type: 'CELL.SELECT'; cell: Cell }

// The context (extended state) of the machine
interface GameContext {
  cells: CellAndRef[]
}

const initialContext: GameContext = {
  cells: [
    // { x: 1, y: 1, z: -2, occupied: true },
    // { x: 2, y: -1, z: -1, occupied: true },
    // { x: 1, y: 2, z: -3, occupied: true },
    // { x: 0, y: 3, z: -3, occupied: true },
    { x: 0, y: 0, z: 0, occupied: true }, // center
    { x: -1, y: 1, z: 0, occupied: true }, // top left
    // { x: 0, y: 1, z: -1, occupied: true }, // top center
    // { x: 1, y: 0, z: -1, occupied: true }, // top right
    // { x: -1, y: 0, z: 1, occupied: true }, // bottom left
    // { x: 0, y: -1, z: 1, occupied: true }, // bottom center
    // { x: 1, y: -1, z: 0, occupied: true }, // bottom right
  ],
}

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>({
  key: 'game',
  initial: 'initial',
  context: initialContext,
  states: {
    initial: {
      entry: assign({
        cells: (context) => {
          // "Rehydrate" persisted cells
          return context.cells.map((cell) => ({
            ...cell,
            ref: spawn(createCellMachine(cell)),
          }))
        },
      }),
      always: 'ready',
    },
    ready: {},
  },
  on: {
    'CELL.SELECT': {
      actions: (context, event) => {
        // TODO: use correct comparison function from lib here
        const cell = context.cells.find(
          (c) =>
            c.x === event.cell.x && c.y === event.cell.y && c.z === event.cell.z
        )
        if (!cell) {
          return
        }
        cell.ref.send('SELECT')
      },
    },
  },
})
