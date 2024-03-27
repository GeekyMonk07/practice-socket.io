import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { Button, Container, TextField, Typography, Stack } from '@mui/material'

const App = () => {
  const socket = useMemo(() => io('http://localhost:3000', {
    withCredentials: true,
  }), [])

  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [room, setRoom] = useState("")
  const [socketId, setSocketId] = useState("")
  const [roomName, setRoomName] = useState("")

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id)
      console.log('Connected', socket.id)
    })
    socket.on('welcome', (data) => {
      console.log(data)
    })
    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data])
      console.log(data)
    })

    return () => {
      socket.disconnect()
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    socket.emit('message', { message, room })
    setMessage('')
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    socket.emit('join-room', roomName)
    setRoomName('')
  }

  return (
    <Container maxWidth='sm'>
      <Typography variant='h4' align='center' component='div' gutterBottom>Welcome to Socket.io</Typography>
      <Typography variant='h6' align='center' component='div' gutterBottom>{socketId}</Typography>

      <form onSubmit={handleJoinRoom}>
        <h5>Join Room</h5>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id='message' label='Room Name' variant='outlined' fullWidth margin='normal' />
        <Button type='submit' variant='contained' color='primary' fullWidth>Join Room</Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id='message' label='Message' variant='outlined' fullWidth margin='normal' />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          id='message' label='Room' variant='outlined' fullWidth margin='normal' />
        <Button type='submit' variant='contained' color='primary' fullWidth>Send</Button>
      </form>

      <Stack>
        {
          messages.map((msg, i) => (
            <Typography key={i} variant='body1' component='div' gutterBottom>{msg}</Typography>
          ))
        }
      </Stack>
    </Container>
  )
}

export default App