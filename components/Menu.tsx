import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { generateRoomId } from '../lib/p2p'

const Menu = () => {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [generated, setGenerated] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      return
    }
    router.push({
      pathname: 'rooms/' + code,
      query: {},
    })
  }

  useEffect(() => {
    // useEffect so the generated roomId is the same on client and server
    setGenerated(generateRoomId())
  }, [])

  return (
    <div className="flex flex-col justify-center ">
      <a
        href={'/rooms/' + generated + '?create=1'}
        className="btn hover:bg-gray-400"
      >
        Create game
      </a>

      <div className="text-center my-8">OR</div>

      <form
        onSubmit={() => handleSubmit}
        className="flex flex-col justify-center"
      >
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          type="text"
          placeholder="Room code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <a
          href={'/rooms/' + code}
          className={'btn' + (!code ? ' btn-disabled' : ' hover:bg-gray-400')}
        >
          Join game
        </a>
        <button onClick={handleSubmit} className="hidden" type="submit" />
      </form>
    </div>
  )
}

export default Menu
