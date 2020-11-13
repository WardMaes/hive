import Head from 'next/head'
import { useContext } from 'react'

import { gameContext } from '../context/machines'

import { InsectSelector, Board, Menu, Loader } from '../components'

export default function Home() {
  const [gameState, sendToGame] = useContext(gameContext)

  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {gameState.matches('menu') && (
          <div className="my-32 p-8 bg-white shadow-md rounded">
            <Menu />
          </div>
        )}

        {gameState.matches('creating') && (
          <div className="my-32">
            <Loader text="Creating game..." />
          </div>
        )}

        {gameState.matches('joining') && (
          <div className="my-32">
            <Loader text="Joining game..." />
          </div>
        )}

        {gameState.matches('error') && (
          <div className="my-32 flex flex-col justify-center items-center text-center">
            <h2 className="text-2xl">An error occured </h2>
            <span className="text-red-600 my-4">
              {JSON.stringify(gameState.context.error, null, 2)}
            </span>
            <button
              className="btn hover:bg-gray-400"
              onClick={() => sendToGame('RESET')}
            >
              Back to menu
            </button>
          </div>
        )}

        {(gameState.matches('playing') ||
          gameState.matches('opponentTurn')) && (
          <div className="game" style={{ width: '100%' }}>
            <div className="fixed top-0 right-0 p-4">
              {playerToMove ? 'Your turn' : "Opponent's turn"}
            </div>
            <div className="board-wrapper">
              <Board
                cells={gameState.context.cells}
                selectableCells={gameState.context.selectableCells}
              />
            </div>
            <div className="insect-selector">
              <InsectSelector
                playerHand={
                  gameState.context.currentPlayer === 1
                    ? gameState.context.unplayedInsectsPlayer1
                    : gameState.context.unplayedInsectsPlayer2
                }
              />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
