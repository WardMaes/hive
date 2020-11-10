import Peer from 'simple-peerjs'

export async function createRoom() {
  const peer = new Peer({
    host: 'peer-connection.herokuapp.com',
    port: 80,
    path: '/peerjs/hive',
    initiator: true,
  })

  const x = await peer.id
  console.log('id', x)

  peer.on('connect', function (conn: any) {
    console.log('Peer connected:', conn.peerId)
    conn.peer.on('data', (data) => {
      console.log(data.toString())
      conn.peer.send('hi you 2')
    })
  })
}

export async function joinRoom(roomId: string) {
  console.log('joining room', roomId)
  const peer = new Peer({
    host: 'peer-connection.herokuapp.com',
    port: 80,
    path: '/peerjs/hive',
    initiator: false,
  })

  const id = await peer.id
  const x2 = await peer.connect(roomId, {})

  x2.peer.send('hi')

  x2.peer.on('data', (data) => {
    console.log('data in 2', data.toString())
  })
}
