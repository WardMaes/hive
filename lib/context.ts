import React from 'react'
import { Interpreter, State } from 'xstate'

import { CounterContext, CounterEvent } from './machines/counter'

export const counterContext = React.createContext<
  [
    State<CounterContext, CounterEvent>,
    Interpreter<CounterContext, any, CounterEvent>['send'],
    Interpreter<CounterContext, any, CounterEvent>
  ]
>([
  {} as State<CounterContext, CounterEvent>,
  ((() => {}) as any) as Interpreter<CounterContext, any, CounterEvent>['send'],
  {} as Interpreter<CounterContext, any, CounterEvent>,
])
