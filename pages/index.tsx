import Head from 'next/head'
import { useContext } from 'react'

import { gameContext } from '../context/machines'

import InsectSelector from '../components/InsectSelector'
import Board from '../components/Board'
import Menu from '../components/Menu'

export default function Home() {
  const [gameState] = useContext(gameContext)

  const playerToMove =
    gameState.context.playerId === gameState.context.currentPlayer

  // TODO if unused, remove
  // useEffect(() => {
  //   const subscription = service.subscribe((state) => {
  //     // simple state logging
  //     // console.log('in useeffect', state)
  //   })

  //   return subscription.unsubscribe
  // }, [service]) // note: service should never change

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {gameState.matches('menu') && (
          <div className="my-32">
            <Menu />
          </div>
        )}

        {gameState.matches('playing') && (
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
                insects={
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
