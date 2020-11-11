import { GetServerSideProps } from 'next'
import React from 'react'

type RoomProps = {
  id: string
  roomId: string
  initiator: boolean
}

const Room = ({ id, roomId, initiator }: RoomProps) => {
  return (
    <div>
      id: {JSON.stringify(id)}
      roomId: {JSON.stringify(roomId)}
      initiator: {JSON.stringify(initiator)}
    </div>
  )
}

export default Room

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Generate id based on roomId and return this

  const roomId = context.params?.roomId
  const id = 'sick' // TODO: generate
  const initiator = true

  return { props: { id, roomId, initiator } }
}
