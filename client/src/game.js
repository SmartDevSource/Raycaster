import { initializeScene, draw } from "./engine/raycaster.js"

const socket = io()

const handleSockets = () => {
    socket.on('connect', () => {
        console.log(`Connection established with host`)
    })
    socket.on('map_data', map_data => {
        initializeGame(map_data)
    })
    socket.on('players', players => {
        console.log(JSON.parse(players))
    })
    socket.on('player_leave', id => {
        console.log(`Player with id ${id} leave the game`)
    })
}

const initializeGame = async (map_data) => {
    await initializeScene(map_data)
}

handleSockets(socket)