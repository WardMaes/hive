import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/client'

import { Menu } from '../components'

export default function Page() {
  const [session] = useSession()

  const getRedemptions = async () => {
    if (!session) {
      return
    }
    const res = await fetch(
      'https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?reward_id=&broadcaster_id=' +
        session.user_id,
      {
        headers: {
          Authorization: 'Bearer ' + session.access_token,
          'Client-Id': 'ex4mnguf70q3gj1xgre1xwzv4u24s8',
        },
      }
    )
    const answer = await res.json()
    console.log('answer', answer)
  }

  const createReward = async () => {
    if (!session) {
      return
    }
    const res = await fetch(
      'https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=' +
        session.user_id,
      {
        method: 'POST',
        body: JSON.stringify({
          title: 'test reward',
          cost: 10,
        }),
        headers: {
          Authorization: 'Bearer ' + session.access_token,
          'Client-Id': 'ex4mnguf70q3gj1xgre1xwzv4u24s8',
          'Content-Type': 'application/json',
        },
      }
    )
    const answer = await res.json()
    console.log('answer', answer)
  }

  return (
    <>
      <Head>
        <title>The Hive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="my-32 p-8 bg-white shadow-md rounded max-w-2xl">
          {!session && (
            <>
              Not signed in <br />
              <button onClick={() => signIn()}>Sign in</button>
            </>
          )}
          {session && (
            <div className="max-w-md">
              Signed in as {JSON.stringify(session, null, 2)} <br />
              <button onClick={() => signOut()}>Sign out</button>
              <button onClick={() => getRedemptions()}>Test api</button>
              <button onClick={() => createReward()}>Create</button>
              <Menu />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
