import { keys, mouse, clock } from './structs.js'
import { camera } from './engine/camera.js'
import { map } from './map.js'

const mouse_x_factor = 0.0025

onkeydown = e => inputHandler(e.key.toLowerCase(), true)
onkeyup = e => inputHandler(e.key.toLowerCase(), false)
onmousemove = e => mouseHandler(e)

const inputHandler = (key, is_down) => {
    if (keys[key] !== undefined)
        keys[key] = is_down
}

const mouseHandler = e => {
    if (document.pointerLockElement){
        camera.rotation.x += e.movementX * mouse_x_factor * mouse.sensitivity
        camera.rotation.y -= e.movementY * mouse.sensitivity

        camera.rotation.x = ((camera.rotation.x + Math.PI) % (2 * Math.PI)) - Math.PI;
        if (camera.rotation.y < -camera.max_y_angle){
            camera.rotation.y = -camera.max_y_angle
        } else if (camera.rotation.y > camera.max_y_angle){
            camera.rotation.y = camera.max_y_angle
        }
    }
}

export const inputListener = () => {
    let next_velocity = {x: 0, y: 0}
    let speed_move = (keys.z && keys.q) || (keys.z && keys.d) || 
                       (keys.s && keys.q) || (keys.s && keys.d) ?
                       camera.speed_move * Math.SQRT1_2 : camera.speed_move
    if (keys.shift){
        speed_move *= camera.run_factor
        camera.is_running = true
    } else {
        camera.is_running = false
    }
    if (keys.z){
        next_velocity.x = (speed_move * Math.cos(camera.rotation.x)) * clock.delta_time
        next_velocity.y = (speed_move * Math.sin(camera.rotation.x)) * clock.delta_time
    }
    if (keys.s){
        next_velocity.x = -(speed_move * Math.cos(camera.rotation.x)) * clock.delta_time
        next_velocity.y = -(speed_move * Math.sin(camera.rotation.x)) * clock.delta_time
    }
    if (keys.q){
        next_velocity.x -= (speed_move * Math.cos(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
        next_velocity.y -= (speed_move * Math.sin(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
    }
    if (keys.d){
        next_velocity.x -= -(speed_move * Math.cos(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
        next_velocity.y -= -(speed_move * Math.sin(camera.rotation.x + (Math.PI / 2))) * clock.delta_time
    }
    if (keys['+']){
        camera.fog_factor += .1
    }
    if (keys['-']){
        camera.fog_factor -= .1
    }

    camera.is_moving = (keys.q || keys.z || keys.d || keys.s)

    const new_x = camera.position.x + next_velocity.x
    const new_y = camera.position.y + next_velocity.y    

    if (!checkCollision(new_x, camera.position.y)){
        camera.position.x = new_x
    }
    if (!checkCollision(camera.position.x, new_y)){
        camera.position.y = new_y
    }
}

const checkCollision = (x, y) => {
    const check_points = [
        {x: x + camera.radius, y},
        {x: x - camera.radius, y},
        {x, y: y + camera.radius},
        {x, y: y - camera.radius}
    ]
    return check_points.some(p => getMapCell(p.y, p.x) != 0)
}

const getMapCell = (y, x) => {
    const y_grid = Math.floor(y / map.grid_offset)
    const x_grid = Math.floor(x / map.grid_offset)
    if (x_grid === -1 || y_grid === -1)
        return 1
    return map.walls[y_grid][x_grid]
}