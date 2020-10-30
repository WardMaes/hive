import { createContext } from 'react'
import { Interpreter, State } from 'xstate'

import { GameContext, GameEvent } from '../machines/game'
import { TurnContext, TurnEvent } from '../machines/turn'

export const gameContext = createContext<
  [
    State<GameContext, GameEvent>,
    Interpreter<GameContext, any, GameEvent>['send'],
    Interpreter<GameContext, any, GameEvent>
  ]
>([
  {} as State<GameContext, GameEvent>,
  ((() => {}) as any) as Interpreter<GameContext, any, GameEvent>['send'],
  {} as Interpreter<GameContext, any, GameEvent>,
])

export const turnContext = createContext<
  [
    State<TurnContext, TurnEvent>,
    Interpreter<TurnContext, any, TurnEvent>['send'],
    Interpreter<TurnContext, any, TurnEvent>
  ]
>([
  {} as State<TurnContext, TurnEvent>,
  ((() => {}) as any) as Interpreter<TurnContext, any, TurnEvent>['send'],
  {} as Interpreter<TurnContext, any, TurnEvent>,
])
