// @ts-ignore : typings don't exist for this package
import Peer from 'simple-peerjs'

import { Context } from '../machines/types'

type PeerType = {
  id: Promise<string>
  on: Function
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

export async function createRoom(callback: Function) {
  peer1 = new Peer({
    host: 'peer-connection.herokuapp.com',
    secure: true,
    port: 443,
    path: '/peerjs/hive',
    initiator: true,
    simplePeer: {
      config: {
        iceServers: [
          {
            urls: 'turn:relay.backups.cz',
            credential: 'webrtc',
            username: 'webrtc',
          },
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'nofaxe3842@wgraj.com',
            credential: 'nofaxe3842@wgraj.com',
          },
          {
            urls: 'turn:relay.backups.cz?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc',
          },
        ],
      },
    },
  })

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
  const peer = new Peer({
    host: 'peer-connection.herokuapp.com',
    secure: true,
    port: 443,
    path: '/peerjs/hive',
    initiator: false,
    simplePeer: {
      config: {
        iceServers: [
          {
            urls: 'turn:relay.backups.cz',
            credential: 'webrtc',
            username: 'webrtc',
          },
          {
            urls: 'turn:relay.backups.cz?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc',
          },
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'nofaxe3842@wgraj.com',
            credential: 'nofaxe3842@wgraj.com',
          },
        ],
      },
    },
  })

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
