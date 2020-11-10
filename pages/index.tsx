import Head from 'next/head'
import { useContext } from 'react'

import { gameContext } from '../context/machines'
import Board from '../components/Board'
import InsectSelector from '../components/InsectSelector'

export default function Home() {
  const [gameState] = useContext(gameContext)

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="game" style={{ width: '100%' }}>
          <div className="board-wrapper">
            <Board />
          </div>
          <div className="insect-selector">
            <InsectSelector
              insects={gameState.context.unplacedInsectsPlayer1!}
            />
          </div>
        </div>
      </main>
    </>
  )
}
