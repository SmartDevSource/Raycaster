import { keys, camera, mouse, clock } from './vars.js'

onkeydown = e => inputHandler(e.key.toLowerCase(), true)
onkeyup = e => inputHandler(e.key.toLowerCase(), false)
onmousemove = e => mouseHandler(e)

const inputHandler = (key, is_down) => {
    if (keys[key] !== undefined)
        keys[key] = is_down
}

const mouseHandler = e => {
    if (document.pointerLockElement){
        camera.rotation.x += e.movementX * 0.0025 * mouse.sensitivity
        camera.rotation.y -= e.movementY * mouse.sensitivity

        camera.rotation.x = (camera.rotation.x + Math.PI * 2) % (Math.PI * 2)
        if (camera.rotation.y < -camera.max_y_angle){
            camera.rotation.y = -camera.max_y_angle
        } else if (camera.rotation.y > camera.max_y_angle){
            camera.rotation.y = camera.max_y_angle
        }
    }
}

export const inputListener = () => {
    if (keys.z){
        camera.position.x += (camera.speed_move * Math.cos(camera.rotation.x)) * clock.delta_time
        camera.position.y += (camera.speed_move * Math.sin(camera.rotation.x)) * clock.delta_time
    }
    if (keys.s){
        camera.position.x -= (camera.speed_move * Math.cos(camera.rotation.x)) * clock.delta_time
        camera.position.y -= (camera.speed_move * Math.sin(camera.rotation.x)) * clock.delta_time
    }
    if (keys.q){
        camera.position.x -= (camera.speed_move * Math.cos(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
        camera.position.y -= (camera.speed_move * Math.sin(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
    }
    if (keys.d){
        camera.position.x -= (camera.speed_move * Math.cos(camera.rotation.x - (Math.PI / 2))) * clock.delta_time
        camera.position.y -= (camera.speed_move * Math.sin(camera.rotation.x - (Math.PI / 2))) * clock.delta_time
    }
}