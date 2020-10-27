import { NextComponentType } from 'next'
import { AppContext, AppInitialProps, AppProps } from 'next/app'
import { useMachine } from '@xstate/react'

import '../styles/index.css'
import { counterMachine } from '../lib/machines/counter'
import { counterContext as CounterContext } from '../lib/context'

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  const modifiedPageProps = { ...pageProps }

  const machine = useMachine(counterMachine, { devTools: true })

  return (
    <CounterContext.Provider value={machine}>
      <Component {...modifiedPageProps} />
    </CounterContext.Provider>
  )
}

export default MyApp
