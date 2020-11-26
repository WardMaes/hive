// @ts-ignore : typings don't exist for this package
import Peer from 'simple-peerjs'

import { Context } from '../machines/types'

import ice_servers from '../config/webrtc_ICE_servers.json'

// enum PeerEventType {
//   connect = 'connect',
//   data = 'data',
//   close = 'close',
//   error = 'error',
// }

type PeerType = {
  id: Promise<string>
  on: (event: string, callback: Function) => {}
  connect: Function
  send: Function
  peer?: ConnectionType
}

type ConnectionType = {
  peerId: string
  peer: PeerType
  send: Function
}

type DataType = {}

let peer1: PeerType
let peer2: ConnectionType

export async function createRoom(roomId: string, callback: Function) {
  peer1 = createPeer(true, roomId)

  peer1.on('error', function (error: any) {
    throw new Error(error)
  })

  const id = await peer1.id

  peer1.on('connect', function (connection: ConnectionType) {
    console.log('Peer connected:', connection.peerId)
    peer2 = connection

    connection.peer.on('data', (data: DataType) => {
      // connection.peer.send(JSON.stringify({ hi2: 'hi you 2' }))
      const parsed = JSON.parse(data.toString())

      if (parsed.type === 'sync') {
        // send SYNC event to game machine
        callback({ type: 'SYNC', state: parsed.data })
      }
    })
  })

  return id
}

export async function joinRoom(roomId: string, callback: Function) {
  const peer = createPeer(false)

  peer.on('error', function (error: any) {
    throw new Error(error)
  })

  // const id = await peer.id
  const x2 = await peer.connect(roomId, {})

  peer2 = x2
  // x2.peer.send(JSON.stringify({ hi: 'hi' }))

  x2.peer.on('data', (data: DataType) => {
    const parsed = JSON.parse(data.toString())

    if (parsed.type === 'sync') {
      // Send SYNC event to game machine
      callback({ type: 'SYNC', state: parsed.data })
    }
  })
}

export async function sync(context: Context) {
  console.log('syncing')
  // User is host
  if (context.roomId && peer1 && peer1.peer) {
    peer1.peer.send(
      JSON.stringify({
        type: 'sync',
        data: context,
      })
    )
  } else if (peer2 && peer2.peer) {
    // User is joiner
    peer2.peer.send(
      JSON.stringify({
        type: 'sync',
        data: context,
      })
    )
  }
}

export const generateRoomId = () => {
  return Math.random().toString(26).substring(5, 10)
}

const createPeer = (initiator: boolean, id?: string) => {
  return new Peer({
    id,
    host: 'peer-connection.herokuapp.com',
    secure: true,
    port: 443,
    path: '/peerjs/hive',
    initiator: initiator,
    simplePeer: {
      config: {
        iceServers: ice_servers,
      },
    },
  })
}
