import Head from 'next/head'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex flex-col justify-center items-center">
          The Hive
        </div>
      </main>
    </div>
  )
}
