import { assign, Machine } from 'xstate'

export interface CounterContext {
  count: number
}

export type CounterEvent = {
  type: 'INCREASE'
}

export type CounterState =
  | {
      value: 'initializing'
      context: CounterContext & { count: undefined }
    }
  | {
      value: 'active'
      context: CounterContext
    }

export const counterMachine = Machine<CounterContext, any, CounterEvent>(
  {
    id: 'counter',
    initial: 'initializing',
    states: {
      initializing: {
        entry: assign({
          count: () => {
            return 0
          },
        }),
        always: 'active',
      },
      active: {
        on: {
          INCREASE: [{ actions: ['increase'] }],
        },
      },
    },
  },
  {
    actions: {
      increase: assign({ count: (ctx, _event) => ctx.count + 1 }),
    },
  }
)
