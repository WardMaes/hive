import Head from 'next/head'
import { useContext } from 'react'

import { counterContext } from '../lib/context'

export default function Home() {
  const [state, send] = useContext(counterContext)

  const increase = () => {
    send({ type: 'INCREASE' })
  }

  return (
    <div className="container">
      <Head>
        <title>Boilerplate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex flex-col justify-center items-center">
          <p>Count: {state.context.count}</p>
          <button className="btn" onClick={increase}>
            Increase
          </button>
        </div>
      </main>
    </div>
  )
}
