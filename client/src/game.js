import { initializeScene, draw } from "./engine/raycaster.js"

const socket = io()

const handleSockets = () => {
    socket.on('connect', () => {
        console.log(`Connection established with host`)
    })
    socket.on('map_data', map_data => {
        initializeGame(map_data)
    })
}

const initializeGame = async (map_data) => {
    await initializeScene(map_data)
}

handleSockets(socket)