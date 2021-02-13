import { io } from 'socket.io-client'

import { Context } from '../machines/types'

const socket = io('https://backend-hive.herokuapp.com')

socket.on('connected', (socketId: string) => {
  console.log('connected', socketId)

  socket.on('ROOM.CREATED', (roomId: string) => {
    console.log(`Created room ${roomId}`)
  })

  socket.on('ROOM.JOINED', (roomId: string) => {
    console.log(`Joined room ${roomId}`)
  })

  socket.on('disconnect', (/* reason: string */) => {
    console.log('disconnected!', socket)
    socket.emit('PLAYER.DISCONNECT', socket.id)
  })
})

export async function createRoom(roomId: string, callback: Function) {
  console.log('creating game')
  socket.emit('ROOM.CREATE', roomId)

  socket.on('SYNC', (context: Context) => {
    console.log('callbacking')
    callback({ type: 'SYNC', state: context })
  })
}

export async function joinRoom(roomId: string, callback: Function) {
  console.log('joingin', roomId)
  socket.emit('ROOM.JOIN', roomId)

  callback({ type: 'SYNC', state: { hi: 'test' } })

  socket.on('SYNC', (context: Context) => {
    console.log('callbacking')
    callback({ type: 'SYNC', state: context })
  })
}

export async function sync(context: Context) {
  console.log('syncing', context)
  socket.emit('SYNC', context)
}

export const generateRoomId = () => {
  return Math.random().toString(26).substring(5, 10)
}
