require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const socket_io = require('socket.io')

const PORT = process.env.PORT

app.use(express.static(path.join(__dirname, '..', 'client')))

server.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`)
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
})