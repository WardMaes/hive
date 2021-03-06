import { createContext } from 'react'
import { Interpreter, State } from 'xstate'

import { Context, Event, Schema } from '../machines/types'

export const gameContext = createContext<
  [
    State<Context, Event>,
    Interpreter<Context, Schema, Event>['send'],
    Interpreter<Context, Schema, Event>
  ]
>([
  {} as State<Context, Event>,
  ((() => {}) as any) as Interpreter<Context, Schema, Event>['send'],
  {} as Interpreter<Context, Schema, Event>,
])
