import { useMachine } from '@xstate/react'
import { NextComponentType } from 'next'
import { AppContext, AppInitialProps, AppProps } from 'next/app'

import { gameContext as GameContext } from '../context/machines'
import { gameMachine } from '../machines/game'

import '../styles/index.css'

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  const modifiedPageProps = { ...pageProps }

  const game = useMachine(gameMachine)

  return (
    <GameContext.Provider value={game}>
      <Component {...modifiedPageProps} />
    </GameContext.Provider>
  )
}

export default MyApp
