import { useMachine } from '@xstate/react'
import { NextComponentType } from 'next'
import { AppContext, AppInitialProps, AppProps } from 'next/app'

import {
  gameContext as GameContext,
  turnContext as TurnContext,
} from '../context/machines'
import { gameMachine } from '../machines/game'
import { turnMachine } from '../machines/turn'

import '../styles/index.css'

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  const modifiedPageProps = { ...pageProps }

  const game = useMachine(gameMachine)
  const turn = useMachine(turnMachine)

  return (
    <GameContext.Provider value={game}>
      <TurnContext.Provider value={turn}>
        <Component {...modifiedPageProps} />
      </TurnContext.Provider>
    </GameContext.Provider>
  )
}

export default MyApp
