import Head from 'next/head'
import { useContext } from 'react'

import { gameContext } from '../context/machines'

import Board from '../components/Board'
import Menu from '../components/Menu'

export default function Home() {
  const [gameState] = useContext(gameContext)

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {gameState.matches('menu') && <Menu />}
        {gameState.matches('playing') && (
          <Board cells={gameState.context.cellsOnBoard} />
        )}
      </main>
    </>
  )
}
