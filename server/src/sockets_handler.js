const map_data = require('../src/data/map.json')

const handleSockets = io => {
    io.on('connection', socket => {
        socket.emit('map_data', JSON.stringify(map_data))
        console.log(`New connection (socket id) : ${socket.id}`)
    })
}

module.exports = { handleSockets }