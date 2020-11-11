import React, { useContext, useState } from 'react'

import { gameContext } from '../context/machines'

const Debug = () => {
  const [show, setShow] = useState(false)
  const [state] = useContext(gameContext)
  return (
    <div className="debug">
      <label>
        Debug
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
      </label>
      {show && (
        <pre>
          <div>State: {JSON.stringify(state.value, null, 2)}</div>
          <div>Context: {JSON.stringify(state.context, null, 2)}</div>
        </pre>
      )}
    </div>
  )
}

export default Debug
