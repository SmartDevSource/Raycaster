const handleSockets = io => {
    io.on('connection', socket => {
        console.log(`New connection (socket id) : ${socket.id}`)
    })
}

module.exports = { handleSockets }