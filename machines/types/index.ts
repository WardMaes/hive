import { TurnContext, TurnEvent } from './turn.types'
import { GameContext, GameEvent, GameStateSchema } from './game.types'

export type Schema = GameStateSchema

export type Context = GameContext & TurnContext

export type Event = GameEvent | TurnEvent
