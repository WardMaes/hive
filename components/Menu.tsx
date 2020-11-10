import React, { useContext, useState } from 'react'
import { gameContext } from '../context/machines'

const Menu = () => {
  const [gameState, sendToGame] = useContext(gameContext)
  const [code, setCode] = useState('')

  return (
    <div className="flex flex-col justify-center ">
      <button className="btn" onClick={() => sendToGame('GAME.CREATE')}>
        Create game
      </button>

      <div className="text-center my-8">OR</div>

      <form
        onSubmit={() => sendToGame('GAME.JOIN', { code })}
        className="flex flex-col justify-center"
      >
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          type="text"
          placeholder="Room code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className={'btn' + (!code ? ' btn-disabled' : '')}
          type="submit"
          disabled={!code}
        >
          Join game
        </button>
      </form>
    </div>
  )
}

export default Menu
