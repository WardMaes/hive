import { TurnStateSchema } from './turn.types'
import { Cell, PlayerHand } from '../../lib/game'

/* Schema */

export interface GameStateSchema {
  states: {
    menu: {}
    joining: {}
    creating: {}
    searching: {}
    error: {}
    playing: TurnStateSchema
    checkGameFinished: {}
    alternating: {}
    opponentTurn: {}
    opponentDone: {}
    gameOver: {}
  }
}

/* Context */

export interface GameContext {
  cells: Cell[]
  currentPlayer: number
  turn: number
  unplayedInsectsPlayer1: PlayerHand
  unplayedInsectsPlayer2: PlayerHand
  roomId: string
  playerId: number
  error: string | undefined
}

/* Event */

export type GameEvent =
  | { type: 'TURN.OVER' }
  | { type: 'GAME.JOIN'; roomId: string }
  | { type: 'GAME.CREATE'; roomId: string }
  | { type: 'GAME.SEARCH' }
  | { type: 'SYNC'; state: GameContext }
  | { type: 'PEER.ERROR'; error: string }
  | { type: 'RESET' }
  | { type: 'ONLINE.OPPONENTTURNDONE'; state: GameContext }
