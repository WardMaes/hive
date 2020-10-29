import Head from 'next/head'
import { useMachine } from '@xstate/react'

import Board from '../components/Board'
import { gameMachine } from '../machines/game'

export default function Home() {
  const [state, send] = useMachine(gameMachine)
  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Board
          cells={state.context.cells}
          onPlace={(cell) => send('CELL.SELECT', { cell })}
        />
      </main>
    </>
  )
}
