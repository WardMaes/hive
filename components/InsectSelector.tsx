import { useContext } from 'react'

import { Insect } from '../lib/insect'
import { gameContext } from '../context/machines'

type InsectSelectorProps = {
  insects: Insect[]
}

const InsectSelector = ({ insects }: InsectSelectorProps) => {
  const [test, sendToGame] = useContext(gameContext)

  return (
    <div className="flex flex-row justify-center content-center h-full flex-wrap">
      {insects.map((insect, i) => (
        <div
          className="insect"
          key={i + 1}
          onClick={() => {
            console.log(test)
            sendToGame('PLACESELECT', { insect })
          }}
        >
          {JSON.stringify(insect, null, 2)}
        </div>
      ))}
    </div>
  )
}

export default InsectSelector
