import { TurnContext, TurnEvent } from './turn.types'
import { GameContext, GameEvent } from './game.types'

export type Context = GameContext & TurnContext

export type Event = GameEvent | TurnEvent
