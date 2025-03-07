import { map } from '../map.js'
import { draw2dLine, drawCircle, drawHud } from './draw.js'
import { images } from '../resources/images.js'
import { screen_resolution, clock, radians_fov, width_fov, sparkling, lighter } from '../vars.js'
import { camera } from './camera.js'
import { inputListener } from '../input_handler.js'
import { loadResources } from '../resources/resources_handler.js'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = screen_resolution.w
canvas.height = screen_resolution.h
const half_screen = {x: canvas.width / 2, y: canvas.height / 2}

const floor_height = 750
const z_buffer = new Array(canvas.width)

const current_item = 'lighter'

const get2dPlaneColor = tile_type => {
    switch(true){
        case tile_type.startsWith('w'): return 'white'
        case tile_type.startsWith('f'): return 'lime'
    }
}
const draw2dMap = () => {
    ctx.save()
    ctx.scale(.2, .2)
    for (let y = 0 ; y < map.tiles.length ; y++){
        for (let x = 0 ; x < map.tiles[y].length ; x++){
            if (map.tiles[y][x] !== '___'){
                ctx.strokeStyle = get2dPlaneColor(map.tiles[y][x])
                ctx.lineWidth = 5
                ctx.strokeRect(
                    (x * map.grid_offset),
                    (y * map.grid_offset),
                    map.grid_offset,
                    map.grid_offset
                )
            }
        }
    }
    drawCircle(
        ctx,
        camera.position,
        10,
        'lime'
    )
    draw2dLine(
        ctx,
        camera.position,
        camera.center_dist_ray,
        5,
        'red'
    )
    ctx.restore()
}
const drawSky = () => {
    const skybox = images.skyboxes[map.skybox].img
    const sky_width = skybox.width
    const sky_height = skybox.height

    const offset = {
        x: (-camera.rotation.x / Math.PI) * sky_width, 
        y: -(sky_height / 2) + camera.rotation.y
    }
    offset.x = (offset.x % sky_width + sky_width) % sky_width
    
    ctx.drawImage(skybox, offset.x, offset.y)

    if (offset.x > 0) {
        ctx.drawImage(skybox, (offset.x + 1) - sky_width, offset.y)
    } else {
        ctx.drawImage(skybox, offset.x + sky_width, offset.y)
    }
}
const drawFloor = () => {
    const start_y = (canvas.height / 2) + camera.rotation.y
    const floor_gradient = ctx.createLinearGradient(0, start_y, 0, start_y + 255)
    floor_gradient.addColorStop(0, "black")
    const close_floor_color = `
        rgb(
            ${60 + parseInt(lighter.flickering.value * 100)},
            ${40 + parseInt(lighter.flickering.value * 100)},
            ${20 + parseInt(lighter.flickering.value * 100)}
        )
    `
    floor_gradient.addColorStop(1, sparkling.is_active ? "#4c3321" : close_floor_color)
    ctx.fillStyle = floor_gradient
    ctx.fillRect(
        0,
        start_y,
        canvas.width,
        floor_height
    )
}
const drawCamera = () => {
    for (let w = 0; w <= canvas.width; w++) {
        const ray_angle = camera.rotation.x + radians_fov / 2 - w * width_fov
        const ray_dir_x = Math.cos(ray_angle)
        const ray_dir_y = Math.sin(ray_angle)
        
        let map_x = Math.floor(camera.position.x / map.grid_offset)
        let map_y = Math.floor(camera.position.y / map.grid_offset)

        const delta_dist_x = Math.abs(1 / ray_dir_x)
        const delta_dist_y = Math.abs(1 / ray_dir_y)

        let step_x, step_y
        let side_dist_x, side_dist_y

        if (ray_dir_x < 0){
            step_x = -1
            side_dist_x = (camera.position.x / map.grid_offset - map_x) * delta_dist_x
        } else {
            step_x = 1
            side_dist_x = (map_x + 1 - camera.position.x / map.grid_offset) * delta_dist_x
        }
        if (ray_dir_y < 0){
            step_y = -1
            side_dist_y = (camera.position.y / map.grid_offset - map_y) * delta_dist_y
        } else {
            step_y = 1
            side_dist_y = (map_y + 1 - camera.position.y / map.grid_offset) * delta_dist_y
        }

        let hit = false
        let side = 0
        let tile_content = ''

        while (!hit){
            if (side_dist_x < side_dist_y){
                side_dist_x += delta_dist_x
                map_x += step_x
                side = 0
            } else {
                side_dist_y += delta_dist_y
                map_y += step_y
                side = 1
            }
            if (map.tiles[map_y][map_x].startsWith('w')){
                tile_content = map.tiles[map_y][map_x]
                hit = true
            }
        }

        const perp_wall_dist = (side === 0) ?
            ((map_x - camera.position.x / map.grid_offset) + (1 - step_x) / 2) / ray_dir_x :
            ((map_y - camera.position.y / map.grid_offset) + (1 - step_y) / 2) / ray_dir_y

        const corrected_distance = perp_wall_dist * Math.cos(ray_angle - camera.rotation.x)

        const x_wall = (canvas.width - w)
        const height_projection = (canvas.height / corrected_distance) * 1
        const top_wall = (half_screen.y - height_projection) + camera.rotation.y
        const bottom_wall = (half_screen.y + height_projection) + camera.rotation.y

        let texture_offset = (side === 0) ?
            (camera.position.y / map.grid_offset + perp_wall_dist * ray_dir_y) % 1 :
            (camera.position.x / map.grid_offset + perp_wall_dist * ray_dir_x) % 1

        const current_texture = images.textures[tile_content.slice(1)]
        texture_offset = Math.floor(texture_offset * current_texture.img.width)

        ctx.drawImage(
            current_texture.img,
            texture_offset, 0,
            1, current_texture.img.height,
            x_wall, top_wall,
            1, bottom_wall - top_wall
        )

        if (!sparkling.is_active){
            let fog = (corrected_distance / camera.fog_factor)
            if (fog < 0) fog = 0
            if (fog > 1) fog = 1
            ctx.fillStyle = `rgba(0, 0, 0, ${fog})`
            ctx.fillRect(
                x_wall, top_wall - 1,
                1, bottom_wall - top_wall + 2
            )
        }

        lighter.intensity = Math.min(1 / (perp_wall_dist), .7)
        lighter.intensity = Math.exp(-perp_wall_dist * 0.3)
        const light_alpha = Math.min(lighter.intensity + lighter.flickering.value, .8)
        ctx.fillStyle = `rgba(
            255,
            ${150 - (lighter.intensity)},
            5,
            ${light_alpha}
        )`
        ctx.fillRect(
            x_wall, top_wall,
            1, bottom_wall - top_wall
        )

        // if (side === 0){
        //     ctx.fillStyle = 'rgba(0, 0, 0, .5)'
        //     ctx.fillRect(
        //         x_wall, top_wall,
        //         1, bottom_wall - top_wall
        //     )
        // }

        if (w === canvas.width / 2){
            camera.center_dist_ray.x = camera.position.x + corrected_distance * ray_dir_x * map.grid_offset
            camera.center_dist_ray.y = camera.position.y + corrected_distance * ray_dir_y * map.grid_offset
        }

        z_buffer[w] = perp_wall_dist
    }
    // console.log("zbuffer :", zbuffer)
}
const updateSparkling = () => {
    if (!sparkling.next){
        sparkling.next = Math.floor(Math.random() * (10 - 3) + 3) * 1000
        setTimeout(() => {
            sparkling.is_active = true
            setTimeout(()=> {
                sparkling.is_active = false
                sparkling.next = null
            }, 100)
        }, sparkling.next)
        sparkling.times = 0
    }
}
const updateLight = () => {
    lighter.flickering.value += lighter.flickering.speed * clock.delta_time
    if (Math.abs(lighter.flickering.value) >= Math.abs(lighter.flickering.max)){
        lighter.flickering.speed = -lighter.flickering.speed
    }
}
const drawScene = () => {
    drawSky()
    drawFloor()
    drawCamera()
    updateSparkling()
    updateLight()
    draw2dMap()
    drawHud(ctx, current_item, images.hud_sprites)
}
const updateClock = timeStamp => {
    clock.delta_time = Math.min((timeStamp - clock.last_update) / 1000, 0.016)
    clock.last_update = timeStamp
}
const draw = (timeStamp) => {
    requestAnimationFrame(draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const fps = Math.round(1 / ((timeStamp - clock.last_update) / 1000))
    updateClock(timeStamp)
    inputListener()
    if (clock.delta_time){
        drawScene()
    }
    // FPS //
    ctx.fillStyle = 'white'
    ctx.font = '30px bold'
    ctx.fillText(`FPS : ${fps}`, 500, 50)
}
const initAndRun = async () => {
    try {
        canvas.addEventListener('click', () => {
            // canvas.requestFullscreen().then(()=>{
            //     canvas.requestPointerLock()
            // })
            canvas.requestPointerLock()
        })
        await loadResources(ctx, images)
        draw()
    } catch (err) {
        console.log(`Error while loading resources : ${err}`)
    }
}

initAndRun()