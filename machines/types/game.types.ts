import { Cell, PlayerHand } from '../../lib/game'
// import {  } from "../../lib/game";

/* 
    Context
*/

export interface GameContext {
  // TODO dislike the 2 seperate cells collections, possible alternative
  // Specific for frontend, all cells to render
  cells: Cell[]
  // For internal use, keeps track of all permanent cells on board which contain pieces
  boardCells: Cell[]
  currentPlayer: number
  turn: number
  unplayedInsectsPlayer1: PlayerHand
  unplayedInsectsPlayer2: PlayerHand
}

/* 
    Event
*/

export type GameEvent =
  | { type: 'TURN.OVER' }
  | { type: 'GAME.JOIN'; code: string }
  | { type: 'GAME.CREATE' }
