import { Cell, Game } from '../../lib/game'
import { Insect } from '../../lib/insect'
// import {  } from "../../lib/game";

/* 
    Context
*/

export interface GameContext {
  // Game-specific context
  cellsOnBoard?: Cell[]
  currentPlayer: number
  game?: Game
  turn: number
  unplacedInsectsPlayer1?: Insect[]
  unplacedInsectsPlayer2?: Insect[]
}

/* 
    Event
*/

export type GameEvent = { type: 'TURN.OVER' }
