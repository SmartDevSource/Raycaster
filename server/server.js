require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const { handleSockets } = require('./src/sockets_handler.js')

const PORT = process.env.PORT

app.use(express.static(path.join(__dirname, '..', 'client')))

server.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
})

handleSockets(io)