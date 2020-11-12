import { TurnStateSchema } from './turn.types'
import { Cell, PlayerHand } from '../../lib/game'
// import {  } from "../../lib/game";

/* 
  Schema
*/

export interface GameStateSchema {
  states: {
    menu: {}
    joining: {}
    creating: {}
    playing: TurnStateSchema
    checkGameFinished: {}
    alternating: {}
    gameOver: {}
  }
}

/* 
    Context
*/

export interface GameContext {
  cells: Cell[]
  currentPlayer: number
  turn: number
  unplayedInsectsPlayer1: PlayerHand
  unplayedInsectsPlayer2: PlayerHand
  roomId: string
  playerId: number
}

/* 
    Event
*/

export type GameEvent =
  | { type: 'TURN.OVER' }
  | { type: 'GAME.JOIN'; code: string }
  | { type: 'GAME.CREATE' }
  | { type: 'SYNC'; state: GameContext }
