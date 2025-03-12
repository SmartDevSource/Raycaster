import { initAndRun, draw } from "./engine/raycaster.js"
const socket = io()

const launchGame = async () => {
    await initAndRun()
    draw()
}

launchGame()
