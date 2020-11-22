import Head from 'next/head'

import { Menu } from '../components'

export default function Home() {
  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="my-32 p-8 bg-white shadow-md rounded">
          <Menu />
        </div>
      </div>
    </>
  )
}
