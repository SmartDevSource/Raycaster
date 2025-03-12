let io = null

module.exports = {
    init: server => {
        io = require('socket.io')(server)
        return io
    },
    getIO: () => {
        if (!io){
            throw new error('Socket.IO not initialized')
        }
        return io
    }
}