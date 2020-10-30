import Head from 'next/head'

import Board from '../components/Board'

import { useContext } from 'react'

import { gameContext } from '../context/machines'

export default function Home() {
  const [gameState, sendToGame] = useContext(gameContext)

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Board cells={gameState.context.cellsPlacedPieces} />
      </main>
    </>
  )
}
