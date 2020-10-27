import { NextComponentType } from 'next'
import { AppContext, AppInitialProps, AppProps } from 'next/app'

import '../styles/index.css'

const MyApp: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  const modifiedPageProps = { ...pageProps }
  return <Component {...modifiedPageProps} />
}

export default MyApp
