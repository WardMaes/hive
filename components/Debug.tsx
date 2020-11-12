import React, { useContext, useState } from 'react'

import { gameContext } from '../context/machines'

const Debug = () => {
  const [show, setShow] = useState(true)
  const [state] = useContext(gameContext)

  let seen: string[] = []
  return (
    <div className="debug">
      <label>
        Debug
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
      </label>
      {show && (
        <pre>
          <div>
            State:{' '}
            {JSON.stringify(
              state.value,
              function (_, val) {
                if (val != null && typeof val == 'object') {
                  if (seen.indexOf(val) >= 0) {
                    return
                  }
                  seen.push(val)
                }
                return val
              },
              2
            )}
          </div>
          <div>
            Context:{' '}
            {JSON.stringify(
              state.context,
              function (_, val) {
                if (val != null && typeof val == 'object') {
                  if (seen.indexOf(val) >= 0) {
                    return
                  }
                  seen.push(val)
                }
                return val
              },
              2
            )}
          </div>
        </pre>
      )}
    </div>
  )
}

export default Debug
