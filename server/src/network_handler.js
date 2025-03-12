const map_data = require('./data/map.json')
const { Player } = require('./classes/player.js')
const socket = require('./modules/socket.js')

const handleSockets = (players) => {
    const io = socket.getIO()

    io.on('connection', socket => {
        const new_player = new Player({
            id: socket.id,
            position: {x: 100, y: 512},
            rotation: {x: -Math.PI, y: 0}
        })
        socket.emit('map_data', JSON.stringify(map_data))
        socket.join('game_room')
        players[socket.id] = new_player
        sendToRoom("game_room", 'players', JSON.stringify(players))
        console.log(`Connection from socket id: ${socket.id}`)


        socket.on('disconnect', () => {
            if (players[socket.id]){
                console.log(`Disconnection from socket id: ${socket.id}`)
                delete players[socket.id]
                sendToRoom("game_room", 'player_leave', socket.id)
            }
        })
    })
}

const sendToRoom = (room, header, data) => {
    const io = socket.getIO()
    io.to(room).emit(header, data)
}

const showGameState = players => {
    console.log("Players length :", Object.keys(players).length)
}

module.exports = { handleSockets }