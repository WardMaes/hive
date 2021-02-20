import { io } from 'socket.io-client'
import { getSession } from 'next-auth/client'
// const WebSocket = require('ws')

import { Context } from '../machines/types'

const socket = io('http://localhost:3001')

function initMatchmakingSocket() {
  if (!process.browser) {
    return
  }

  const matchmakingSocket = new WebSocket(
    'ws://localhost:8888/api/matchmaking/queue'
  )

  matchmakingSocket.onopen((x) => {
    console.log('matchmakingsocket connection', x)
    matchmakingSocket.send('Hello!')
  })

  matchmakingSocket.onmessage((data) => {
    console.log('matchmakingSocket message', data)
  })

  matchmakingSocket.onerror((error) => {
    console.log('matchmakingSocket ERROR', error.message)
  })
}

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

  if (!window.location.href.includes('rooms/')) {
    window.location.href = 'http://localhost:3000/rooms/' + roomId
  }

  callback({ type: 'SYNC', state: { ...context, roomId } })

  socket.on('SYNC', (context: Context) => {
    console.log('callbacking')
    callback({ type: 'SYNC', state: { ...context, roomId } })
  })
}

export async function searchGame(callback: Function) {
  const session = await getSession()
  const { userId } = session
  // TODO: create socket connection with matchmaking backend
  // TODO: send gamesearch event to matchmaking-socket
  // TODO: on answer, joinRoom(roomId) (passed as callback)
  initMatchmakingSocket()
  const roomId = 'test1'
  setTimeout(() => {
    callback({ type: 'GAME.JOIN', roomId })
  }, 2000)
}

export async function sync(context: Context, roomId: string) {
  console.log('syncing', context, roomId)
  socket.emit('SYNC', { ...context, roomId })
}

export const generateRoomId = () => {
  return Math.random().toString(26).substring(5, 10)
}
