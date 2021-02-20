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

export async function createRoom(
  roomId: string,
  callback: Function,
  context: Context
) {
  console.log('creating game', roomId, context)
  socket.emit('ROOM.CREATE', roomId)

  callback({ type: 'SYNC', state: { ...context, roomId } })

  socket.on('SYNC', (context: Context) => {
    console.log('callbacking')
    callback({ type: 'SYNC', state: context })
  })
}

export async function joinRoom(
  roomId: string,
  callback: Function,
  context: Context
) {
  console.log('joingin', roomId)
  socket.emit('ROOM.JOIN', roomId)

  callback({ type: 'SYNC', state: { ...context, roomId } })

  socket.on('SYNC', (context: Context) => {
    console.log('callbacking')
    callback({ type: 'SYNC', state: { ...context, roomId } })
  })
}

export async function sync(context: Context, roomId: string) {
  console.log('syncing', context, roomId)
  socket.emit('SYNC', { ...context, roomId })
}

export const generateRoomId = () => {
  return Math.random().toString(26).substring(5, 10)
}
