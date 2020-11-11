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
  console.log('creating room')
  peer1 = new Peer({
    host: 'peer-connection.herokuapp.com',
    port: 80,
    path: '/peerjs/hive',
    initiator: true,
  })

  console.log('peer1', peer1)

  const id = await peer1.id

  peer1.on('connect', function (connection: ConnectionType) {
    console.log('Peer connectionected:', connection.peerId)
    peer2 = connection

    connection.peer.on('data', (data: DataType) => {
      // connection.peer.send(JSON.stringify({ hi2: 'hi you 2' }))

      const parsed = JSON.parse(data.toString())
      console.log('parsed', parsed)

      if (parsed.type === 'sync') {
        // send SYNC event to game machine
        callback({ type: 'SYNC', state: parsed.data })
      }
    })
  })

  return id
}

export async function joinRoom(roomId: string, callback: Function) {
  console.log('joining room', roomId)
  const peer = new Peer({
    host: 'peer-connection.herokuapp.com',
    port: 80,
    path: '/peerjs/hive',
    initiator: false,
  })

  // const id = await peer.id
  const x2 = await peer.connect(roomId, {})

  peer2 = x2
  // x2.peer.send(JSON.stringify({ hi: 'hi' }))

  x2.peer.on('data', (data: DataType) => {
    const parsed = JSON.parse(data.toString())
    console.log('parsed2', parsed)

    if (parsed.type === 'sync') {
      // send SYNC event to game machine
      callback({ type: 'SYNC', state: parsed.data })
    }
  })
}

export async function sync(context: Context) {
  console.log('syncing')
  // user is host
  if (context.roomId && peer1 && peer1.peer) {
    console.log('sending to 2')
    peer1.peer.send(
      JSON.stringify({
        type: 'sync',
        data: context,
      })
    )
  } else if (peer2 && peer2.peer) {
    // user is joiner
    console.log('sending to 1')
    peer2.peer.send(
      JSON.stringify({
        type: 'sync',
        data: context,
      })
    )
  }
}

// function sendToHost(dataToSend)

// function sendToJoiners(dataToSend)

// function createRoom(): connectionId1

// function joinRoom(connectionId1): connectoinId2
